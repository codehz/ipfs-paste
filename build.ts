import {
  compileFileClient,
  generateHeader,
} from "https://deno.land/x/pug@v0.1.1/mod.ts";
import { parse } from "https://deno.land/std@0.97.0/flags/mod.ts";
import { debounce } from "https://deno.hertz.services/chodorowicz/ts-debounce/src/index.ts";
import {
  ensureDir,
  expandGlob,
  walk,
} from "https://deno.land/std@0.97.0/fs/mod.ts";
import { sep } from "https://deno.land/std@0.97.0/path/mod.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";

const args = parse(Deno.args);

await ensureDir("build");

async function compile() {
  console.time("build");
  for await (const entry of expandGlob("view/*.pug")) {
    try {
      const header = generateHeader(entry.name);
      const result = compileFileClient(entry.path, {
        compileDebug: !!args.release,
        inlineRuntimeFunctions: false,
        basedir: "view",
      });
      await Deno.writeTextFile(
        `build/${entry.name.replace(/\.pug$/, ".js")}`,
        "// deno-fmt-ignore-file\n" + header + result,
      );
      console.timeLog("build", entry.name);
    } catch (e) {
      console.error(e);
    }
  }
  console.timeEnd("build");
}

async function embed_static() {
  console.time("static");
  let cache = "// deno-fmt-ignore\n";
  cache += `import EmbededFile from "./embeded.ts";\n`;
  cache += "export const fs = {\n";
  for await (const entry of walk("static")) {
    if (entry.isDirectory) continue;
    const stripped = entry.path
      .substring("static/".length)
      .replaceAll(sep, "/");
    const mt = mime.getType(entry.path);
    if (mt?.startsWith("text/")) {
      const contents = await Deno.readTextFile(entry.path);
      // deno-fmt-ignore
      const value = `new EmbededFile(${JSON.stringify(mt)}, ${JSON.stringify(contents)})`;
      cache += `  [${JSON.stringify(stripped)}]: ${value},\n`;
    } else {
      const contents = await Deno.readFile(entry.path);
      const data = `new Uint8Array([${contents.join(", ")}])`;
      const value = `new EmbededFile(${JSON.stringify(mt)}, ${data})`;
      // deno-fmt-ignore
      cache += `  [${JSON.stringify(stripped)}]: ${value},\n`;
    }
    console.timeLog("static", entry.path);
  }
  cache += "};\n";
  cache +=
    "export function contains(name: string): name is keyof typeof fs {\n";
  cache += "  return name in fs;\n";
  cache += "}\n";
  console.timeLog("static", "write");
  await Deno.writeTextFile("static.ts", cache);
  console.timeEnd("static");
}

if (!!args.watch) {
  const buildView = async () => {
    const f = debounce(compile, 1000);
    await f();
    for await (const _ of Deno.watchFs("view")) {
      await f();
    }
  };
  const buildStatic = async () => {
    const f = debounce(embed_static, 1000);
    await f();
    for await (const _ of Deno.watchFs("view")) {
      await f();
    }
  };
  await Promise.all([
    buildView(),
    buildStatic(),
  ]);
} else {
  await Promise.all([
    compile(),
    embed_static(),
  ]);
}

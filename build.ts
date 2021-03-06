import {
  compileFileClient,
  generateHeader,
} from "https://deno.land/x/pug@v0.1.1/mod.ts";
import { parse } from "https://deno.land/std@0.97.0/flags/mod.ts";
import {
  ensureDir,
  expandGlob,
  walk,
} from "https://deno.land/std@0.97.0/fs/mod.ts";
import { sep } from "https://deno.land/std@0.97.0/path/mod.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import { compress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";
import { compile as compileLS } from "https://deno.hertz.services/codehz/deno-livescript@v0.1.0";

mime.define({ "text/livescript": ["ls"] });
mime.define({ "image/x-icon": ["ico"] }, true);

function debounce<Args>(
  cb: (...args: Args[]) => void,
  duration: number,
): (...args: Args[]) => void {
  let timer = -1;
  return ((...args: Args[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => cb(...args), duration);
  });
}

const args = parse(Deno.args);

const production = !!args.production;

await ensureDir("build");

const ignred = `// deno-fmt-ignore-file
// deno-lint-ignore-file
`;

const encoder = new TextEncoder();

async function getCompressed(path: string) {
  const content = await Deno.readFile(path);
  const compressed = compress(content);
  return `new Uint8Array([${compressed.join(", ")}])`;
}

async function getCompiledAndCompressed(path: string) {
  const content = await Deno.readTextFile(path);
  const compiled = compileLS(content);
  const compressed = compress(encoder.encode(compiled));
  return `new Uint8Array([${compressed.join(", ")}])`;
}

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
        ignred + header + result,
      );
      console.timeLog("build", entry.name);
    } catch (e) {
      console.error(e);
    }
  }
  console.timeEnd("build");
}

async function embedStatic() {
  console.time("static");
  let cache = ignred;
  cache += `import EmbededFile from "./embeded.ts";\n`;
  cache += `console.time("load");\n`;
  cache += "export const fs = {\n";
  for await (const entry of walk("static")) {
    if (entry.isDirectory) continue;
    const stripped = entry.path
      .substring("static/".length)
      .replaceAll(sep, "/");
    const mt = mime.getType(entry.path) ?? "application/octet-stream";
    const isls = mt == "text/livescript";
    if (production) {
      if (isls) {
        // deno-fmt-ignore
        const value = `EmbededFile.compressed(${JSON.stringify(mt)}, ${await getCompiledAndCompressed(entry.path)}, ${JSON.stringify(stripped)})`;
        // deno-fmt-ignore
        cache += `  ${JSON.stringify(stripped.replace(/ls$/, "js"))}: ${value},\n`;
      } else {
        // deno-fmt-ignore
        const value = `EmbededFile.compressed(${JSON.stringify(mt)}, ${await getCompressed(entry.path)}, ${JSON.stringify(stripped)})`;
        cache += `  ${JSON.stringify(stripped)}: ${value},\n`;
      }
    } else {
      if (isls) {
        // deno-fmt-ignore
        const value = `await EmbededFile.compile(${JSON.stringify(stripped)})`
        // deno-fmt-ignore
        cache += `  ${JSON.stringify(stripped.replace(/ls$/, "js"))}: ${value},\n`;
      } else {
        // deno-fmt-ignore
        const value = `await EmbededFile.load(${JSON.stringify(mt)}, ${JSON.stringify(stripped)})`
        cache += `  ${JSON.stringify(stripped)}: ${value},\n`;
      }
    }

    console.timeLog("static", entry.path);
  }
  cache += "};\n";
  cache += `console.timeEnd("load");\n`;
  cache +=
    "export function contains(name: string): name is keyof typeof fs {\n";
  cache += "  return name in fs;\n";
  cache += "}\n";
  console.timeLog("static", "write");
  await Deno.writeTextFile("static.ts", cache);
  console.timeEnd("static");
}

if (args.watch) {
  const buildView = async () => {
    const f = debounce(compile, 1000);
    await f();
    for await (const _ of Deno.watchFs("view")) {
      await f();
    }
  };
  const buildStatic = async () => {
    const f = debounce(embedStatic, 1000);
    await f();
    for await (const _ of Deno.watchFs("static")) {
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
    embedStatic(),
  ]);
}

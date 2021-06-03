import {
  compileFileClient,
  generateHeader,
} from "https://deno.land/x/pug@v0.1.1/mod.ts";
import { parse } from "https://deno.land/std@0.97.0/flags/mod.ts";
import { debounce } from "https://deno.hertz.services/chodorowicz/ts-debounce/src/index.ts";
import { ensureDir, expandGlob } from "https://deno.land/std@0.97.0/fs/mod.ts";

const args = parse(Deno.args);

await ensureDir("build");

async function compile() {
  console.log("build");
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
        header + result,
      );
    } catch (e) {
      console.error(e)
    }
  }
}

if (!!args.watch) {
  const f = debounce(compile, 1000);
  await f();
  for await (const _ of Deno.watchFs("view")) {
    await f();
  }
} else {
  compile();
}

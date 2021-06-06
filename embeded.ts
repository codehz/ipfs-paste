import { Sha256 } from "https://deno.land/std@0.97.0/hash/sha256.ts";
import { compile } from "https://deno.hertz.services/codehz/deno-livescript";
import { decompress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";

export default class EmbededFile {
  etag: string;

  constructor(public mime: string, public content: string | ArrayBuffer) {
    const hasher = new Sha256();
    hasher.update(content);
    this.etag = hasher.hex();
  }

  build(head = false): Response {
    return new Response(
      head ? null : this.content,
      {
        headers: {
          "etag": this.etag,
          "content-type": this.mime,
        },
      },
    );
  }

  static compressed(mime: string, compressed: Uint8Array) {
    const data = decompress(compressed);
    console.timeLog("load", "[extracted]");
    return new EmbededFile(mime, data);
  }

  static async load(mime: string, path: string): Promise<EmbededFile> {
    const binary = !mime.startsWith("text/");
    const url = new URL("static/" + path, import.meta.url);
    const resp = await fetch(url);
    const data = binary ? await resp.arrayBuffer() : await resp.text();
    console.timeLog("load", url.toString());
    return new EmbededFile(mime, data);
  }

  static async compile(path: string): Promise<EmbededFile> {
    const url = new URL("static/" + path, import.meta.url);
    const resp = await fetch(url);
    const source = await resp.text();
    const target = compile(source);
    console.timeLog("load", url.toString(), "[compile]");
    return new EmbededFile("text/javascript", target);
  }
}

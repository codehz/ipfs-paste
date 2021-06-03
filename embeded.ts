import { Sha256 } from "https://deno.land/std@0.97.0/hash/sha256.ts";

export default class EmbededFile {
  etag: string;

  constructor(public mime: string, public content: string | ArrayBuffer) {
    const hasher = new Sha256();
    hasher.update(content);
    this.etag = hasher.hex();
  }

  build(head: boolean = false): Response {
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

  static async load(mime: string, path: string): Promise<EmbededFile> {
    const binary = !mime.startsWith("text/");
    const url = new URL("static/" + path, import.meta.url);
    const resp = await fetch(url);
    const data = binary ? await resp.arrayBuffer() : await resp.text();
    return new EmbededFile(mime, data);
  }
}

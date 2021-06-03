import { Sha256 } from "https://deno.land/std@0.97.0/hash/sha256.ts";

export default class EmbededFile {
  etag: string;

  constructor(public mime: string, public content: string | Uint8Array) {
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
}

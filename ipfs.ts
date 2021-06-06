import { extname } from "https://deno.land/std@0.97.0/path/posix.ts";

export interface Options {
  base: URL;
}

export enum FileType {
  Raw = 0,
  Directory = 1,
  File = 2,
  Metadata = 3,
  Symlink = 4,
  HAMTShard = 5,
}

export interface FileEntry {
  Name: string;
  Hash: string;
  Size: number;
  Type: FileType;
  Target: string;
}

interface Objects {
  Hash: string;
  Links: FileEntry[];
}

const decoder = new TextDecoder();

export class IpfsClient {
  constructor(public options: Options) {
  }

  private async getJson(path: string, qs: URLSearchParams) {
    const url = new URL(path, this.options.base);
    for (const [key, value] of qs) {
      url.searchParams.append(key, value);
    }
    const resp = await fetch(url);
    return await resp.json();
  }

  private async getData(path: string, qs: URLSearchParams) {
    const url = new URL(path, this.options.base);
    for (const [key, value] of qs) {
      url.searchParams.append(key, value);
    }
    const resp = await fetch(url);
    return await resp.arrayBuffer();
  }

  async ls(hash: string) {
    const resp = await this.getJson("ls", new URLSearchParams({ arg: hash }));
    const objects = resp.Objects[0] as Objects;
    return objects.Links;
  }

  async cat(hash: string) {
    return await this.getData(
      "cat",
      new URLSearchParams({ arg: hash, length: "262144" }),
    );
  }

  async generateList(root: string) {
    const list = await this.ls(root);
    const ret: Array<
      Promise<
        {
          type: "file";
          filename: string;
          ext: string;
          inline: boolean;
          content: string;
        } | {
          type: "directory" | "symlink";
          filename: string;
          target: string;
        }
      >
    > = [];
    for (const item of list) {
      switch (item.Type) {
        case FileType.File: {
          ret.push(
            this.cat(item.Hash).then((content) => {
              const ext = extname(item.Name).substring(1);
              try {
                return ({
                  type: "file",
                  filename: item.Name,
                  ext,
                  inline: true,
                  content: decoder.decode(content),
                });
              } catch {
                return ({
                  type: "file",
                  filename: item.Name,
                  ext,
                  inline: false,
                  content: item.Hash,
                });
              }
            }),
          );
          break;
        }
        case FileType.Directory: {
          ret.push(Promise.resolve({
            type: "directory",
            filename: item.Name,
            target: item.Hash,
          }));
          break;
        }
        case FileType.Symlink: {
          ret.push(Promise.resolve({
            type: "symlink",
            filename: item.Name,
            target: item.Target,
          }));
          break;
        }
      }
    }
    return Promise.all(ret);
  }
}

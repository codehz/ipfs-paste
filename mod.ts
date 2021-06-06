/// <reference path="./typings/deploy.d.ts" />

import { Context, Router } from "https://deno.land/x/deploy_route@0.1.0/mod.ts";
import * as views from "./view.ts";
import * as config from "./config.ts";
import * as embeded from "./static.ts";
import { IpfsClient } from "./ipfs.ts";

const client = new IpfsClient({ base: new URL("https://ipfs.io/api/v0/") });
const router = new Router();

router.use(async (event, next) => {
  const time = Date.now();
  await next();
  console.log(
    "[%s] %s %o +%sms",
    event.request.method,
    event.request.url,
    event.params,
    Date.now() - time,
  );
});

router.get("/", async (event) => {
  await event.respondWith(
    new Response(
      views.index({ servers: config.servers }),
      {
        headers: {
          "content-type": "text/html",
        },
      },
    ),
  );
});

router.all("/favicon.ico", async (event) => {
  await event.respondWith(
    new Response(null, {
      status: 301,
      headers: {
        "location": "/static/favicon.ico",
      },
    }),
  );
});

router.all<{ file: string }>("/static/:file", async (event) => {
  if (event.request.method !== "HEAD" && event.request.method !== "GET") {
    await event.respondWith(new Response(null, { status: 405 }));
    return;
  }
  const file = event.params.file;
  if (embeded.contains(file)) {
    const contents = embeded.fs[file];
    const requested = event.request.headers.get("if-none-match") ?? "";
    if (requested == contents.etag) {
      await event.respondWith(new Response(null, { status: 304 }));
    } else {
      await event.respondWith(contents.build(event.request.method === "HEAD"));
    }
  } else {
    await event.respondWith(new Response(null, { status: 404 }));
  }
});

router.get<{ hash: string }>("/ipfs/:hash", async (event) => {
  const hash = event.params.hash;
  try {
    const list = await client.generateList(hash);
    await event.respondWith(
      new Response(
        views.show({
          hash,
          files: list,
        }),
        {
          headers: {
            "content-type": "text/html",
          },
        },
      ),
    );
  } catch (e) {
    console.error(e);
    await event.respondWith(new Response(e + "", { status: 500 }));
  }
});

addEventListener(
  "fetch",
  // deno-lint-ignore no-explicit-any
  (event) => router.dispatch(new Context(event as any)),
);

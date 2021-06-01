/// <reference path="./typings/deploy.d.ts" />

import { Context, Router } from "https://deno.land/x/deploy_route@0.1.0/mod.ts";
import * as views from "./view.ts";
import * as config from "./config.ts";

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
  event.respondWith(
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

router.get<{ file: string }>("/static/:file", async (event) => {
  event.respondWith(
    await fetch(new URL(`static/${event.params.file}`, import.meta.url)),
  );
});

addEventListener(
  "fetch",
  (event) => router.dispatch(new Context(event as any)),
);

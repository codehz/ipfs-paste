/// <reference path="./typings/deploy.d.ts" />

import { Application, Router } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import * as views from "./view.ts";
import * as config from "./config.ts";

const app = new Application();

const router = new Router();

// router.get("/default.css", )

router.get("/", (ctx) => {
  ctx.response.body = views.index({ servers: config.servers });
});

app.use(router.routes());

addEventListener("fetch", app.fetchEventHandler());

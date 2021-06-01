/// <reference path="./typings/handlebars.d.ts" />

import hbs from "https://cdn.skypack.dev/handlebars";

async function load(path: string) {
  const response = await fetch(new URL(`view/${path}.hbs`, import.meta.url));
  return await response.text();
}

async function resolveProductionSkypackURL(path: string) {
  const source = `https://cdn.skypack.dev/${path}`;
  console.log("resolving ", source);
  const response = await fetch(source, {
    method: "HEAD",
    redirect: "manual",
  });
  const ret = response.headers.get("X-Import-URL") ??
    response.headers.get("Location") ?? path;
  return new URL(ret, "https://cdn.skypack.dev/").toString();
}

async function makeSkypackURLMapping(list: string[]) {
  const ret = new Map<string, string>();
  const done = await Promise.all(
    list.map((item) =>
      resolveProductionSkypackURL(item).then((url) => [item, url])
    ),
  );
  for (const [key, value] of done) {
    ret.set(key, value);
  }
  return ret;
}

const cached = await makeSkypackURLMapping([
  "highlight.js/styles/default.css",
  "highlight.js",
]);

function skypack(path: string, options: { hash: { js?: boolean } }) {
  const url = cached.get(path) ?? `https://cdn.skypack.dev/${path}`;
  const escaped = hbs.escapeExpression(url);
  if (options.hash.js) return escaped;
  return new hbs.SafeString(`"${escaped}"`);
}

hbs.registerHelper("skypack", skypack);

const head = await load("head");
const foot = await load("foot");

hbs.registerPartial("head", head);
hbs.registerPartial("foot", foot);

function compile(value: string) {
  return hbs.compile(value, {
    knownHelpers: { skypack: true },
    knownHelpersOnly: true,
    strict: true,
  });
}

export const index = compile(await load("index"));

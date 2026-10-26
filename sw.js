"use strict";
// При изменении файлов сайта увеличьте номер версии: старый кэш удалится сам.
const VERSION = "iman-v14";
const SHELL = "./", FILES = ["./", "index.html", "style.css", "script.js", "manifest.json", "icon-192.png", "icon-512.png"];
const API = "https://api.alquran.cloud/";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Текст Корана не меняется: сначала кэш, потом сеть (и запоминаем)
  if (req.url.startsWith(API)) {
    e.respondWith(caches.open(VERSION + "-api").then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }
  // Шрифты Google: запоминаем при первом открытии, дальше берём из кэша
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(VERSION + "-fonts").then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === "opaque") c.put(req, res.clone());
      return res;
    }));
    return;
  }
  // Файлы сайта: сначала сеть (чтобы обновления доходили), без сети — кэш
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match(SHELL))));
  }
});

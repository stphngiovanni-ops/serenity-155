const CACHE="serenity155-v13-1-admin-match-fix";
const PRECACHE=["/", "/index.html", "/matches.html", "/tournament.html", "/competitive.html", "/family.html", "/tv.html", "/hub.html", "/store.html", "/styles.css", "/family.css", "/tv.css", "/hub.css", "/competitive.css", "/tournament.css", "/script.js", "/site-data.js", "/match-page.js", "/family.js", "/tv.js", "/hub.js", "/competitive.js", "/store.js", "/tournament-page.js", "/cloud-sync.js", "/cloud-boot.js", "/v12-command-media.js", "/v12-loader.js", "/v12-loader.css", "/serenity155-logo.png", "/serenity155-logo.webp", "/nkj-logo.png", "/nkj-store-background.png", "/manifest.webmanifest", "/offline.html", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-192.png", "/icons/maskable-512.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE.filter(Boolean))).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;
  if(req.mode==="navigate"){
    e.respondWith(fetch(req).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res;
    }).catch(async()=> (await caches.match(req)) || (await caches.match("/offline.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(cached=>cached || fetch(req).then(res=>{
    if(res && res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  })));
});

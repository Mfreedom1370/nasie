const V='nasie-v3',F=['./','index.html','css/style.css','js/store.js','js/parser.js','js/telegram.js','js/app.js','manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{if(!e.request.url.startsWith(self.location.origin))return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});

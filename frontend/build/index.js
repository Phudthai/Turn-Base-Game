// index.html
var frontend_default = "./index-r62m0w7b.html";

// index.ts
var port = 3001;
var BACKEND_URL = "http://localhost:8000";
Bun.serve({
  port,
  routes: {
    "/": frontend_default,
    "/api/*": {
      GET: async (req) => {
        const url = new URL(req.url);
        const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
        try {
          const response = await fetch(backendUrl, {
            method: req.method,
            headers: req.headers,
            body: req.body
          });
          return response;
        } catch (error) {
          return new Response(JSON.stringify({ error: "Backend connection failed" }), {
            status: 503,
            headers: { "Content-Type": "application/json" }
          });
        }
      },
      POST: async (req) => {
        const url = new URL(req.url);
        const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
        try {
          const response = await fetch(backendUrl, {
            method: req.method,
            headers: req.headers,
            body: req.body
          });
          return response;
        } catch (error) {
          return new Response(JSON.stringify({ error: "Backend connection failed" }), {
            status: 503,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  },
  development: {
    hmr: true,
    console: true
  }
});
console.log(`\uD83C\uDFAE Idle: Picoen Frontend running at http://localhost:${port}`);

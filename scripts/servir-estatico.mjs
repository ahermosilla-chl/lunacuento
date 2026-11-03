// Servidor estático mínimo para revisar `out/` (equivalente a lo que hará Capacitor o un hosting estático).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon" };

createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, p);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
  } catch {
    file = join(root, "404.html");
    res.statusCode = 404;
  }
  try {
    const body = await readFile(file);
    res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end("404");
  }
}).listen(port, () => console.log(`Sirviendo out/ en http://localhost:${port}`));

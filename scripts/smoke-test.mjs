// Smoke test for a production build: starts `next start`, checks the pages, generated files and
// waitlist endpoint answer as they should, then stops the server. Run `npm run build` first.
//
// Usage: npm run smoke (SMOKE_PORT picks the port; defaults to 3300).
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const port = Number(process.env.SMOKE_PORT ?? 3300);
const base = `http://127.0.0.1:${port}`;
const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));

const server = spawn(process.execPath, [next, "start", "-p", String(port), "-H", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
server.stdout.on("data", (chunk) => (serverOutput += chunk));
server.stderr.on("data", (chunk) => (serverOutput += chunk));

const failures = [];
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${!ok && detail ? ` (${detail})` : ""}`);
  if (!ok) failures.push(name);
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`next start exited early:\n${serverOutput}`);
    try {
      const response = await fetch(base, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`next start didn't answer within ${timeoutMs / 1000}s:\n${serverOutput}`);
}

function postWaitlist(body) {
  return fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

try {
  await waitForServer();

  const home = await fetch(base);
  const html = await home.text();
  check("home page answers 200", home.status === 200, `got ${home.status}`);
  check("home page has the headline", html.includes('id="hero-title"') && html.includes("The answer,"));
  check("home page has the waitlist form", html.includes('id="waitlist"'));

  for (const [path, type] of [
    ["/robots.txt", "text/plain"],
    ["/sitemap.xml", "xml"],
    ["/opengraph-image", "image/png"],
    ["/icon.svg", "image/svg+xml"],
  ]) {
    const response = await fetch(base + path);
    const contentType = response.headers.get("content-type") ?? "";
    check(`${path} answers 200 as ${type}`, response.status === 200 && contentType.includes(type), `got ${response.status} ${contentType}`);
  }

  const devRender = await fetch(`${base}/dev/render?view=front`);
  check("the poster render page is hidden in production", devRender.status === 404, `got ${devRender.status}`);

  const missing = await fetch(`${base}/no-such-page`);
  check("unknown pages answer 404", missing.status === 404, `got ${missing.status}`);

  const malformed = await postWaitlist("{not json");
  check("waitlist rejects malformed JSON with 400", malformed.status === 400, `got ${malformed.status}`);

  const invalid = await postWaitlist({ email: "not-an-email", role: "shop" });
  check("waitlist rejects an invalid email with 422", invalid.status === 422, `got ${invalid.status}`);

  const noRole = await postWaitlist({ email: "sam@example.com", role: "astronaut" });
  check("waitlist rejects an unknown role with 422", noRole.status === 422, `got ${noRole.status}`);

  const valid = await postWaitlist({ email: "sam@example.com", role: "shop" });
  const validBody = await valid.json().catch(() => null);
  check("waitlist accepts a valid sign-up with 201", valid.status === 201 && validBody?.ok === true, `got ${valid.status}`);

  const bot = await postWaitlist({ email: "", role: "", company_website: "spam.example" });
  check("waitlist quietly accepts the spam trap with 201", bot.status === 201, `got ${bot.status}`);
} catch (error) {
  check("server starts", false, error instanceof Error ? error.message : String(error));
} finally {
  server.kill();
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll smoke checks passed.");

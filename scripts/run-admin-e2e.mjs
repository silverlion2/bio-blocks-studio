import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { connect } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

const port = 3179;
const origin = `http://127.0.0.1:${port}`;
const serverEnv = {
  ...process.env,
  ADMIN_PASSWORD: "local-e2e-password-not-for-real-accounts",
  ADMIN_PASSWORD_HASH: "",
  SESSION_SECRET: "local-e2e-session-secret-not-for-real-use-0123456789",
  BLOB_READ_WRITE_TOKEN: "",
  VERCEL_ENV: ""
};

function portOccupied() {
  return new Promise((resolve) => {
    const socket = connect({ host: "127.0.0.1", port });
    socket.once("connect", () => { socket.destroy(); resolve(true); });
    socket.once("error", () => resolve(false));
    socket.setTimeout(1000, () => { socket.destroy(); resolve(true); });
  });
}

function waitForExit(child) {
  return new Promise((resolve) => child.once("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0))));
}

if (!existsSync(".next/BUILD_ID")) {
  throw new Error("Production build missing. Run npm run test:e2e:prod first.");
}
if (await portOccupied()) {
  throw new Error(`Test port ${port} is occupied; refusing to reuse an existing server.`);
}

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: serverEnv,
  stdio: "ignore",
  windowsHide: true
});
let serverExited = false;
server.once("exit", () => { serverExited = true; });
let result = 1;
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (serverExited) throw new Error("Local production server stopped before becoming ready.");
    try {
      const response = await fetch(`${origin}/admin/login`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* Local server may still be starting. */ }
    await delay(500);
  }
  if (!ready) throw new Error("Local production server did not become ready in 60 seconds.");

  const browserGate = spawn(process.execPath, ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)], {
    env: { ...process.env, BIO_E2E_LOCAL_SERVER: "1" },
    stdio: "inherit",
    windowsHide: true
  });
  result = await waitForExit(browserGate);
} finally {
  if (!serverExited) {
    server.kill();
    await Promise.race([waitForExit(server), delay(5000)]);
  }
  if (await portOccupied()) {
    console.error(`Local test server on ${port} did not stop; E2E cleanup failed.`);
    result = 1;
  }
}
process.exitCode = result;

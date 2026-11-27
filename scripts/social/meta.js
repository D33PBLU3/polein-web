// Small Meta Graph API client shared by the social scripts.
//
// The token comes from META_ACCESS_TOKEN (environment, or the git-ignored .env
// in the repo root). It is sent in the Authorization header, never in a URL,
// and is never printed, so it can't leak into logs or CI output.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const GRAPH_VERSION = "v27.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

function loadEnv() {
  const envFile = path.join(ROOT, ".env");
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
}

function token() {
  loadEnv();
  const t = (process.env.META_ACCESS_TOKEN || "").trim();
  if (!t) {
    throw new Error(
      "META_ACCESS_TOKEN is not set. Add a line META_ACCESS_TOKEN=... to the .env file in the repo root (it's git-ignored)."
    );
  }
  return t;
}

class GraphError extends Error {
  constructor(status, err) {
    super(`${err.message || "Graph API error"} (HTTP ${status}, code ${err.code}${err.error_subcode ? `/${err.error_subcode}` : ""})`);
    this.status = status;
    this.code = err.code;
    this.subcode = err.error_subcode;
  }
}

// GET/POST a Graph path, e.g. graph("/me", { fields: "id,name" }).
// accessToken overrides the system user token (e.g. a Page token).
async function graph(pathname, params = {}, { method = "GET", accessToken } = {}) {
  const auth = accessToken || token();
  const qs = new URLSearchParams(params).toString();
  const url = `${GRAPH}${pathname}${method === "GET" && qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${auth}`,
      ...(method !== "GET" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method !== "GET" ? qs : undefined,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) throw new GraphError(res.status, body.error || {});
  return body;
}

module.exports = { graph, token, loadEnv, GraphError, GRAPH_VERSION, ROOT };

import { NextResponse, type NextRequest } from "next/server";
import { callBackend } from "@/lib/api/backend";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * /api/v1, as the browser sees it: a thin forwarder to the backend (ADR-005).
 *
 * The browser keeps calling the same paths on its own origin, with its session
 * in cookies. Each call goes on to apps/api unchanged, with the session's
 * access token as `Authorization: Bearer` — the only credential the backend
 * takes — and the backend's answer comes back unchanged. There is no business
 * logic here and none may be added: a rule decided in this file would be one
 * the mobile app, calling the backend directly, never meets.
 *
 * Two answers are translated, because the session is the web's to keep. A
 * verified sign-in code comes back from the backend as tokens; they are stored
 * as this site's session cookies and the browser is told only that it worked.
 * And a sign-out that the backend has carried out also clears those cookies.
 */
export const dynamic = "force-dynamic";

const UNREACHABLE = { error: { key: "errors.request" } };

async function forward(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  // "." and ".." survive encodeURIComponent and would be resolved by fetch,
  // stepping outside /api/v1 on the backend. No endpoint has such a segment.
  if (path.some((segment) => segment === "." || segment === "..")) {
    return NextResponse.json({ error: { key: "errors.notFound.title" } }, { status: 404 });
  }
  const target = `/api/v1/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let response: Response;
  try {
    response = await callBackend(target, {
      method: request.method,
      body: hasBody ? await request.text() : null,
      contentType: hasBody ? request.headers.get("content-type") : null,
    });
  } catch (error) {
    console.error("api forwarder: backend unreachable", {
      path: path.join("/"),
      error: String(error),
    });
    return NextResponse.json(UNREACHABLE, { status: 503 });
  }

  const route = path.join("/");
  if (route === "auth/verify" && request.method === "POST" && response.ok) {
    return openSession(response);
  }
  if (route === "auth/signout" && request.method === "POST" && response.ok) {
    await closeSession();
  }
  return relay(response);
}

/** The backend's answer, unchanged: its status, its body, its content type. */
async function relay(response: Response): Promise<Response> {
  if (response.status === 204 || response.status === 304) {
    return new Response(null, { status: response.status });
  }
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}

async function openSession(response: Response): Promise<Response> {
  const payload = (await response.json().catch(() => null)) as {
    session?: { access_token?: string; refresh_token?: string };
  } | null;
  const session = payload?.session;
  if (!isSupabaseConfigured() || !session?.access_token || !session.refresh_token) {
    return NextResponse.json({ error: { key: "auth.otp.checkFailed" } }, { status: 502 });
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error) {
    console.error("api forwarder: could not store the session", { status: error.status });
    return NextResponse.json({ error: { key: "auth.otp.checkFailed" } }, { status: 502 });
  }
  return new Response(null, { status: 204 });
}

async function closeSession(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  // The backend has ended the session; this only forgets the cookies. "local"
  // touches no other device's session.
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
}

export { forward as DELETE, forward as GET, forward as POST };

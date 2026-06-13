// supabase/functions/email-assets/index.ts
//
// Public, cacheable host for transactional-email images (the brand logo),
// decoupled from the frontend deploy so emails always have a working absolute
// https URL. verify_jwt = false: serves a static public asset, no user input.
//
// Source of truth is the site favicon (the full-resolution brand lockup, which
// is already hosted). We downscale it once per warm instance to an
// email-friendly size and cache the result in memory. Every failure mode falls
// back to the original bytes, so the logo always renders.

export {}; // mark as an ES module (it uses only a dynamic import otherwise)

const SOURCE_URL = "https://marketentrysecrets.com/favicon.png";
const TARGET_WIDTH = 440; // displays at ~220px (2x for retina)

let cached: Uint8Array | null = null;

async function getLogoBytes(): Promise<Uint8Array> {
  if (cached) return cached;
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`source fetch failed: ${res.status}`);
  const original = new Uint8Array(await res.arrayBuffer());
  try {
    // Dynamic import so a dependency hiccup degrades to the original bytes
    // instead of breaking the whole function at load time.
    const { Image } = await import("https://deno.land/x/imagescript@1.2.17/mod.ts");
    const img = await Image.decode(original);
    img.resize(TARGET_WIDTH, Image.RESIZE_AUTO);
    cached = await img.encode(); // PNG
  } catch (_err) {
    cached = original; // full-res fallback; still the correct logo
  }
  return cached;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      },
    });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const bytes = await getLogoBytes();
    return new Response(req.method === "HEAD" ? null : bytes, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      `logo unavailable: ${err instanceof Error ? err.message : String(err)}`,
      { status: 502 }
    );
  }
});

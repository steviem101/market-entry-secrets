interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export const YouTubeEmbed = ({ videoId, title }: YouTubeEmbedProps) => (
  <div className="my-6 aspect-video w-full overflow-hidden rounded-lg bg-muted not-prose">
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      title={title ?? "YouTube video player"}
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="h-full w-full border-0"
    />
  </div>
);

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, "https://x.invalid");
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v") || "";
        return /^[\w-]{11}$/.test(id) ? id : null;
      }
      const m = u.pathname.match(/^\/(embed|shorts|v)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {
    // ignore
  }
  return null;
}
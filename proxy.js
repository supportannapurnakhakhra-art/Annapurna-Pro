
import { NextResponse } from "next/server";

// List of bots that should be pre-rendered
const BOTS = [
  "googlebot",
  "yahoo",
  "bingbot",
  "baiduspider",
  "ask jeeves",
  "facebookexternalhit",
  "twitterbot",
  "rogerbot",
  "linkedinbot",
  "embedly",
  "quora link preview",
  "showyoubot",
  "outbrain",
  "pinterest/0.",
  "developers.google.com/+/web/snippet",
  "slackbot",
  "vkShare",
  "W3C_Validator",
  "redditbot",
  "Applebot",
  "WhatsApp",
  "flipboard",
  "tumblr",
  "bitlybot",
  "SkypeUriPreview",
  "nuzzel",
  "Discordbot",
  "Google Page Speed",
  "Qwantify",
  "pinterestbot",
  "Bitrix link preview",
  "XING-content-gathering-bot",
  "telegrambot",
  "google-read-aloud",
  "google-lightweight",
];

// File extensions to ignore
const IGNORED_EXTENSIONS = [
  ".js",
  ".css",
  ".xml",
  ".less",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".pdf",
  ".doc",
  ".txt",
  ".ico",
  ".rss",
  ".zip",
  ".mp3",
  ".rar",
  ".exe",
  ".wmv",
  ".doc",
  ".avi",
  ".ppt",
  ".mpg",
  ".mpeg",
  ".tif",
  ".wav",
  ".mov",
  ".psd",
  ".ai",
  ".xls",
  ".mp4",
  ".m4a",
  ".swf",
  ".dat",
  ".dmg",
  ".iso",
  ".flv",
  ".m4v",
  ".torrent",
  ".woff",
  ".ttf",
  ".svg",
  ".webmanifest",
  ".html",
];

export function proxy(request) {
  const userAgent = request.headers.get("user-agent")?.toLowerCase();
  const url = new URL(request.url);
  const path = url.pathname;
  const normalizedPath = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

  // Check if the path should be ignored (e.g., static assets, verification files)
  const isIgnored = IGNORED_EXTENSIONS.some((extension) =>
    normalizedPath.endsWith(extension),
  );

  // Explicitly ignore verification files and other common root assets
  const isStaticAsset =
    normalizedPath.startsWith("/google") ||
    normalizedPath.startsWith("/sitemap") ||
    normalizedPath === "/robots.txt" ||
    normalizedPath === "/favicon.ico";

  if (isIgnored || isStaticAsset) {
    return NextResponse.next();
  }

  const isBot = userAgent && BOTS.some((bot) => userAgent.includes(bot));

  if (isBot) {
    const prerenderUrl = `https://service.prerender.io/${request.url}`;
    const headers = new Headers();
    const HOP_BY_HOP = [
      "connection",
      "keep-alive",
      "proxy-connection",
      "transfer-encoding",
      "upgrade",
      "te",
      "trailer",
      "proxy-authenticate",
      "proxy-authorization",
      "host",
    ];

    for (const [key, value] of request.headers.entries()) {
      if (!HOP_BY_HOP.includes(key.toLowerCase())) {
        headers.append(key, value);
      }
    }

    headers.set(
      "X-Prerender-Token",
      process.env.PRERENDER_TOKEN || "cKoSma8ERylDy8SFmsJC",
    );

    return fetch(prerenderUrl, {
      headers,
      method: request.method,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots\\.txt|sitemap.*\\.xml|google.*\\.html).*)",
  ],
};

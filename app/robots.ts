import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://skillsync-ai.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-in", "/sign-up", "/privacy", "/terms"],
        disallow: ["/dashboard/", "/onboarding/", "/api/", "/report/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

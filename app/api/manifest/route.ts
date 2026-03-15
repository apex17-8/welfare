import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "Pure Path - Welfare Management",
    short_name: "Pure Path",
    description: "Community welfare contribution and management system. Manage family members, track contributions, and receive support when needed.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    categories: ["productivity", "social"],
    icons: [
      {
        src: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
        media: "(prefers-color-scheme: light)"
      },
      {
        src: "/icon-dark-32x32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
        media: "(prefers-color-scheme: dark)"
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      },
      {
        src: "/apple-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      }
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Go to your dashboard",
        url: "/dashboard",
        icons: [
          {
            src: "/icon-dark-32x32.png",
            sizes: "32x32"
          }
        ]
      },
      {
        name: "Make Payment",
        short_name: "Pay",
        description: "Make a contribution payment",
        url: "/dashboard/pay",
        icons: [
          {
            src: "/icon-dark-32x32.png",
            sizes: "32x32"
          }
        ]
      }
    ]
  };

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600, immutable',
      'Access-Control-Allow-Origin': '*'
    },
  });
}

// Optional: Increase revalidation time for better performance
export const revalidate = 3600;

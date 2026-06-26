// 앱 전체 루트 레이아웃 — 폰트, 메타데이터, 모바일 뷰포트 설정
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { QueryProvider } from "@/providers/QueryProvider";
import { AppBridge } from "@/providers/AppBridge";
import { AmplitudeProvider } from "@/providers/AmplitudeProvider";
import { Toaster } from "@/components/ui/Toast";
import { MSWProvider } from "@/mocks/MSWProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Landit — Practice real Korean conversation",
  description: "Practice speaking Korean in real-life situations and get AI feedback on how a native speaker would understand you.",
  keywords: ["learn Korean", "Korean conversation", "speak Korean", "Korean practice", "AI Korean tutor", "Landit"],
  openGraph: {
    title: "Landit — Practice real Korean conversation",
    description: "Practice speaking Korean in real-life situations and get AI feedback on how a native speaker would understand you.",
    siteName: "Landit",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicons/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/favicons/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/favicons/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/favicons/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/favicons/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/favicons/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/favicons/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/favicons/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/favicons/apple-icon-180x180.png", sizes: "180x180" },
    ],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/favicons/apple-icon-precomposed.png" },
    ],
  },
  manifest: "/favicons/manifest.json",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/favicons/ms-icon-144x144.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css"
        />
      </head>
      <body className="h-full bg-zinc-200 text-foreground">
        <div className="mx-auto h-full w-full max-w-[430px] bg-background shadow-xl">
          <AmplitudeProvider>
            <MSWProvider>
              <QueryProvider>
                <AppBridge>{children}</AppBridge>
              </QueryProvider>
            </MSWProvider>
          </AmplitudeProvider>
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

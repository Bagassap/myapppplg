import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import localFont from "next/font/local";

import ProvidersWrapper from "./ProvidersWrapper";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NS App",
  description: "Dashboard Guru",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-sans antialiased bg-primary-50 min-h-screen">
        <ProvidersWrapper>
          <Providers>{children}</Providers>
        </ProvidersWrapper>
      </body>
    </html>
  );
}

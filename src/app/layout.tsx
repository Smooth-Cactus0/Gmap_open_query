import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Prospecting Console",
  description:
    "A self-hosted Google Places prospecting console for discovering and qualifying local businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} app-shell antialiased`}>
        <div className="app-chrome">
          <div className="app-glow app-glow-left" />
          <div className="app-glow app-glow-right" />
          {children}
        </div>
      </body>
    </html>
  );
}

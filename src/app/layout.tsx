import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "The Bread Forge | Adullam Cave Christian Network",
    template: "%s | The Bread Forge",
  },
  description:
    "The official website of Adullam Cave Christian Network (ACCN) — sermons, events, and the ministry's mandate to make ready a people prepared for the LORD.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-ink">{children}</body>
    </html>
  );
}

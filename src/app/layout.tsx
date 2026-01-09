import type { Metadata } from "next";
import { Inter, Cinzel, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700'],
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "Raid Recap",
  description: "WoW Raid Team Post Tier Recap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cinzel.variable} ${outfit.variable}`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-D4FYZT7LT3"
          strategy="afterInteractive"
        />
        <Script id="gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag() {
              dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', 'G-D4FYZT7LT3');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

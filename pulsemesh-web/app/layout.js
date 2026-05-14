import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PulseMesh | Live News Aggregator",
  description: "Live global intelligence network delivering premium news.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <footer className="global-footer">
          <p className="footer-text">
            PulseMesh Intelligence Network &copy; {new Date().getFullYear()} | Curated by <a href="https://x.com/urban_cipher" target="_blank" rel="noreferrer" className="footer-link">@urban_cipher</a>
          </p>
        </footer>
      </body>
    </html>
  );
}

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
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

function OfflineDetector() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js');
            });
          }
          window.addEventListener('offline', () => {
            window.location.href = '/offline';
          });
        `,
      }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <OfflineDetector />
      </head>
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

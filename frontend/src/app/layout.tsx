import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "RapidSketch — AI React Generator",
  description: "Go from concept to live React code in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/logo2.png" />
      </head>
      <body className={`${poppins.className} min-h-full flex flex-col bg-black text-[#e8e8e8] antialiased`}>
        {children}
      </body>
    </html>
  );
}

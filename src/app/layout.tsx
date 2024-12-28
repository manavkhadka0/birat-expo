import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Navbar from "@/components/navbar";
import "./globals.css";
import Footer from "@/components/footer";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Birat Expo 2025",
  description:
    "Birat Expo 2025 - Join us in bridging innovation and investment in Biratnagar, Nepal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={bricolage.className}>
        <Navbar></Navbar>
        {children}
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/NavBar";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Freshli",
  description: "Photo-to-inventory food tracking with expiry bands and recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} font-rubik antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

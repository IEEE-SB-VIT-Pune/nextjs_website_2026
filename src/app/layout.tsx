import type { Metadata } from "next";
import { Inter, Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MagneticCursor from "@/components/ui/magnetic-cursor";
import { Particles } from "@/components/ui/particles";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const inter = Inter({ subsets: ["latin"] });

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-poppins"
});

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "IEEE Student Branch",
  description: "Advancing technology for the benefit of humanity. Join us in our mission to innovate, learn, and grow together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} ${poppins.variable} ${ibmPlexMono.variable} antialiased min-h-screen flex flex-col has-magnetic-cursor`}>
        <ScrollToTop />
        <Particles 
          className="fixed inset-0 -z-10" 
          quantity={80}
          staticity={50}
          ease={50}
          size={0.4}
          color="#ffffff"
        />
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
        <MagneticCursor />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { getTheme } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reseñas",
  description: "Bandeja de reseñas por sede, con borradores de respuesta.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getTheme();

  return (
    <html
      lang="es"
      data-theme={theme === "system" ? undefined : theme}
      className={`${geistSans.variable} h-full antialiased scrollbar-gutter-stable scroll-smooth`}
    >
      <body className="min-h-full font-sans">
        {children}
        <Toaster theme={theme} />
      </body>
    </html>
  );
}

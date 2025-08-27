import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Binzo fun - 11 Mini Games Platform",
  description: "Play 11 exciting mini-games including Ludo, Aviator, Color Prediction, Plinko, and more!",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${workSans.variable} ${openSans.variable} antialiased font-sans`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="min-h-screen flex flex-col" suppressHydrationWarning>
              <Navigation />
              <main className="flex-1">{children}</main>
              <footer className="glass border-t border-border/50 py-4 sm:py-6 px-3 sm:px-4">
                <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-muted-foreground" suppressHydrationWarning>
                  <p className="hidden sm:block">&copy; 2024 Binzo fun. All rights reserved. | Quick Links: Games | Profile | Support</p>
                  <p className="sm:hidden">&copy; 2024 Binzo fun. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

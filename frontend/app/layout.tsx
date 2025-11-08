import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { VoteProvider } from "@/context/VoteContext";
import FloatingChat from "@/components/chat/FloatingChat";
import TopLoader from "@/components/TopLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student-Led Collaboration Platform | Global Student Network",
  description:
    "Join thousands of students worldwide in solving real-world challenges, building meaningful projects, and creating lasting connections across borders. Free platform for global student collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <VoteProvider>
            <ChatProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <SidebarProvider defaultOpen={false}>
                  <AppSidebar />
                  <main className="flex-1 min-h-screen flex flex-col">
                    <TopLoader />
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <div className="flex items-center gap-2 px-2">
                        <SidebarTrigger className="-ml-1" />
                      </div>
                      <TopNav />
                    </header>
                    <div className="flex-1 p-6">{children}</div>
                    <Footer />
                  </main>
                  <FloatingChat />
                </SidebarProvider>
              </ThemeProvider>
            </ChatProvider>
          </VoteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


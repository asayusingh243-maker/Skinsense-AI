import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkinSense AI | Your Personal AI Skincare Assistant",
  description:
    "Analyze your skin using AI, get personalized skincare recommendations, weather-based skincare tips, and budget-friendly product suggestions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-pink-50">
        {children}

        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={12}
          toastOptions={{
            duration: 3500,

            style: {
              background: "#ffffff",
              color: "#374151",
              borderRadius: "18px",
              padding: "16px 20px",
              border: "2px solid #ec4899",
              boxShadow:
                "0 10px 25px rgba(236,72,153,0.25)",
              fontWeight: "600",
              fontSize: "15px",
            },

            success: {
              iconTheme: {
                primary: "#ec4899",
                secondary: "#ffffff",
              },
            },

            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AssessmentProvider } from "@/context/AssessmentContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CogniScan | Clinical Assessment",
  description: "AI-Based Early Cognitive Decline Detection System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AssessmentProvider>
          {/* MEDICAL DISCLAIMER BANNER */}
          <div className="bg-slate-900 text-slate-300 text-xs py-2 text-center font-medium tracking-wide">
            ⚠️ <strong className="text-white">DISCLAIMER:</strong> This is an AI screening tool, not a medical diagnosis. Please consult a neurologist for clinical evaluation.
          </div>
          {children}
        </AssessmentProvider>
      </body>
    </html>
  );
}
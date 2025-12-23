import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "BayesDR - Diabetic Retinopathy Detection",
  description:
    "AI-powered Diabetic Retinopathy detection using Bayesian CNN. Upload fundus images and get accurate classification with confidence scores.",
  keywords: [
    "diabetic retinopathy",
    "AI",
    "medical imaging",
    "eye disease",
    "BCNN",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}

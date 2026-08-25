import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CampusPilot AI", template: "%s · CampusPilot AI" },
  description: "Turn every syllabus into a grounded, editable academic plan.",
  applicationName: "CampusPilot AI",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    title: "CampusPilot AI",
    description:
      "A calmer way to organize the semester—from syllabus to study session.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f0e8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

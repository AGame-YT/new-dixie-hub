import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dixie Hub",
    template: "%s · Dixie Hub"
  },
  description:
    "The student homepage for Dixie Grammar School: homework, timetable, email and useful links.",
  applicationName: "Dixie Hub",
  icons: {
    icon: "/brand/dixie-round.jpg",
    apple: "/brand/dixie-round.jpg"
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

import ChatNotificationPopUp from "@/Components/ChatNotificationPopUp";
import Navbar from "../Components/Navbar";
import "./globals.css";
import Providers from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex flex-col h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-hidden w-full flex flex-col">
              {children}
            </main>
          </div>
          <ChatNotificationPopUp />
        </Providers>
      </body>
    </html>
  );
}

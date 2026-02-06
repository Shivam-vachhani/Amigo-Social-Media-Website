import "./globals.css";
import Providers from "./providers";
import ChatNotificationPopUp from "@/Components/ChatNotificationPopUp";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ChatNotificationPopUp />
        </Providers>
      </body>
    </html>
  );
}

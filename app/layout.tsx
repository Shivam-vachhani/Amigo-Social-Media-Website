import { useGetChatNotification } from "@/hooks/useGetChatNotification";
import "./globals.css";
import Providers from "./providers";
import ChatNotificationPopUp from "@/Components/ChatNotificationPopUp";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useGetChatNotification();
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

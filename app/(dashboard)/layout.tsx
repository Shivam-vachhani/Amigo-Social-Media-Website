// app/(dashboard)/layout.tsx
import Navbar from "@/Components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden w-full flex flex-col">
        {children}
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/navbar";
import BottomNav from "@/components/layout/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Desktop navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 lg:px-8 pb-20 lg:pb-8 pt-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}

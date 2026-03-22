import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompetitionProvider } from '@/lib/context/competition-context'
import Navbar from '@/components/layout/navbar'
import AppSidebar from '@/components/layout/app-sidebar'
import BottomNav from '@/components/layout/bottom-nav'
import { Toaster } from 'sonner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <CompetitionProvider>
      <div className="min-h-screen bg-[#131313]">
        <Navbar />
        <AppSidebar />

        <main className="lg:ml-64 pt-16 min-h-screen">
          {children}
        </main>

        <BottomNav />
        <Toaster richColors position="top-right" />
      </div>
    </CompetitionProvider>
  )
}

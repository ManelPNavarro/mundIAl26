export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-primary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-primary/5 rounded-full blur-[160px]" />
      </div>
      {/* Bottom accent line */}
      <div className="fixed bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-primary to-transparent opacity-30 z-10" />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

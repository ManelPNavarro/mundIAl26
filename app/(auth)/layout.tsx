export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pitch-black-bg min-h-screen">
      {children}
    </div>
  );
}

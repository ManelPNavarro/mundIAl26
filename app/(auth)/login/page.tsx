"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError("Email o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      // Check user role
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single<{ role: string }>();

      if (userData?.role === "admin") {
        router.push("/admin/users");
      } else {
        router.push("/ranking");
      }
    } catch {
      setError("Ha ocurrido un error inesperado. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="pitch-black-bg min-h-screen flex flex-col items-center justify-center p-6 text-on-surface selection:bg-primary selection:text-on-primary">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={3} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <main className="w-full max-w-[440px] flex flex-col items-center">
        {/* Brand Identity */}
        <div className="mb-12 text-center">
          <h1 className="font-bebas text-6xl tracking-tighter uppercase mb-2">
            mund<span className="text-primary text-glow">IA</span>l26
          </h1>
          <p className="text-on-surface-variant text-sm tracking-widest uppercase">
            Editorial Admin Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-low rounded-xl p-8 md:p-12 shadow-2xl relative overflow-hidden w-full">
          {/* Left ornament */}
          <div className="absolute top-0 left-0 w-1 h-full editorial-gradient opacity-80" />

          <div className="mb-8">
            <h2 className="font-bebas text-3xl text-on-surface mb-1">WELCOME BACK</h2>
            <p className="text-on-surface-variant text-sm">Access the digital stadium curator suite.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label
                className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="editor@mundial26.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/50 rounded-lg py-4 px-4 w-full text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-[10px] text-primary hover:underline uppercase tracking-tighter"
                >
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/50 rounded-lg py-4 px-4 w-full text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="editorial-gradient text-on-primary-fixed font-bebas text-xl py-4 rounded-lg tracking-widest w-full shadow-[0px_10px_30px_rgba(0,212,106,0.2)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-on-primary-fixed/30 border-t-on-primary-fixed rounded-full animate-spin" />
                    ENTRANDO...
                  </>
                ) : (
                  "ENTRAR"
                )}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-error text-sm">{error}</p>
            )}
          </form>

        </div>

        {/* Footer Visual Decor */}
        <div className="mt-16 opacity-10 flex gap-4 grayscale">
          <div className="w-16 h-16 rounded-lg bg-surface-container-high" />
          <div className="w-16 h-16 rounded-lg bg-surface-container-high" />
          <div className="w-16 h-16 rounded-lg bg-surface-container-high" />
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-on-surface-variant/40 tracking-[0.2em] uppercase">
            © 2026 mundIAl26 Editorial Team. All Rights Reserved.
          </p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="w-full max-w-4xl grid md:grid-cols-12 gap-0 overflow-hidden rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
      {/* Left panel: brand */}
      <div className="hidden md:flex md:col-span-5 bg-dark-card flex-col justify-between p-10 relative overflow-hidden">
        <div className="z-10">
          <h1 className="font-display text-5xl tracking-widest text-white mb-2">
            MUND<span className="text-green-primary">IA</span>L{" "}
            <span className="text-green-primary">26</span>
          </h1>
          <p className="text-gray-muted text-sm tracking-widest uppercase">
            La quiniela definitiva del Mundial
          </p>
        </div>
        <div className="z-10 space-y-6">
          <div className="space-y-1">
            <span className="text-green-primary font-display text-2xl tracking-tight block">
              LA QUINIELA DEFINITIVA
            </span>
            <p className="text-gray-muted text-sm leading-relaxed">
              Únete a la comunidad de pronósticos más exclusiva del mundo y domina el ranking global.
            </p>
          </div>
        </div>
        {/* Decorative glow */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-primary/5 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {/* Right panel: form */}
      <div className="md:col-span-7 bg-[#2a2a2a] p-8 md:p-12">
        <div className="mb-8">
          <h2 className="font-display text-4xl text-white mb-2">INICIAR SESIÓN</h2>
          <p className="text-gray-muted text-sm">
            Bienvenido de vuelta. Introduce tus credenciales para continuar.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-1.5">
            <label
              className="block text-xs font-semibold text-gray-muted uppercase tracking-wider"
              htmlFor="email"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="javier@estadio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-dark-bg border-none focus:ring-1 focus:ring-green-primary rounded-lg text-white placeholder:text-gray-dim py-3 px-4 transition-all outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              className="block text-xs font-semibold text-gray-muted uppercase tracking-wider"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-dark-bg border-none focus:ring-1 focus:ring-green-primary rounded-lg text-white placeholder:text-gray-dim py-3 px-4 transition-all outline-none"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-accent text-sm py-2 px-4 bg-red-accent/10 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full pitch-gradient text-dark-bg font-bold text-sm tracking-[0.2em] uppercase py-4 rounded-lg shadow-[0_10px_20px_rgba(0,212,106,0.2)] hover:shadow-[0_15px_30px_rgba(0,212,106,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>

          {/* Register link */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-muted uppercase tracking-widest">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="text-green-primary font-bold ml-1 hover:text-white transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guard: only accessible via admin-generated invite link
  useEffect(() => {
    if (!searchParams.get("token")) {
      router.replace("/login");
    }
  }, [searchParams, router]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La foto no puede superar 5MB.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();

    if (!username.trim()) {
      setError("Por favor, introduce un nombre de usuario.");
      return;
    }
    if (!email.trim()) {
      setError("Por favor, introduce tu correo electrónico.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        setError("Error al crear la cuenta. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      let avatarUrl: string | null = null;

      if (photo) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${userId}/avatar.jpg`, photo, {
            upsert: true,
            contentType: photo.type,
          });

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
        } else if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(`${userId}/avatar.jpg`);
          avatarUrl = urlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email,
        username,
        avatar_url: avatarUrl,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push("/ranking");
    } catch {
      setError("Ha ocurrido un error inesperado. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  const inputClass =
    "bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/50 rounded-lg py-4 px-4 w-full text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all";
  const labelClass =
    "block text-xs font-semibold text-on-surface-variant tracking-wider uppercase";

  return (
    <div className="pitch-black-bg min-h-screen flex flex-col items-center justify-center p-6 text-on-surface selection:bg-primary selection:text-on-primary">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]">
        <svg width="100%" height="100%">
          <filter id="noise-register">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={3} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise-register)" />
        </svg>
      </div>

      <main className="w-full max-w-[480px] flex flex-col items-center">
        {/* Register Card */}
        <div className="bg-surface-container-low rounded-xl p-8 md:p-12 shadow-2xl relative overflow-hidden w-full">
          {/* Left ornament */}
          <div className="absolute top-0 left-0 w-1 h-full editorial-gradient opacity-80" />

          <div className="mb-8">
            <h1 className="font-bebas text-5xl text-on-surface mb-2">YOU&apos;VE BEEN SUMMONED</h1>
            <p className="text-on-surface-variant text-sm">Complete your profile to join the competition.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Profile photo upload */}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-outline-variant hover:border-primary rounded-lg py-6 flex flex-col items-center gap-3 transition-colors group cursor-pointer bg-transparent"
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Vista previa"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-4xl">
                    photo_camera
                  </span>
                )}
                <div className="text-center">
                  <span className="block text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                    Foto de Perfil
                  </span>
                  <span className="block text-on-surface-variant/50 text-[10px] uppercase tracking-wider mt-0.5">
                    Opcional • JPG PNG GIF • 5MB
                  </span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className={labelClass} htmlFor="username">
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                placeholder="Ej. javier_hdz"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className={labelClass} htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="javier@estadio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className={labelClass} htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className={labelClass} htmlFor="confirm_password">
                Confirmar Contraseña
              </label>
              <input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-error text-xs">{error}</p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="editorial-gradient text-on-primary-fixed font-bebas text-xl py-4 rounded-lg w-full tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-on-primary-fixed/30 border-t-on-primary-fixed rounded-full animate-spin" />
                    REGISTRANDO...
                  </>
                ) : (
                  "JOIN THE COMPETITION"
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

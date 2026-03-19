"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

    if (!firstName.trim() || !lastName.trim()) {
      setError("Por favor, introduce tu nombre y apellido.");
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
    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
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
        first_name: firstName,
        last_name: lastName,
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
          <h2 className="font-display text-4xl text-white mb-2">CREAR CUENTA</h2>
          <p className="text-gray-muted text-sm">
            Ingresa tus datos para comenzar tu camino a la gloria.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Profile photo upload */}
          <div className="flex items-center space-x-6 mb-2">
            <div className="relative group">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-dark-bg border-2 border-dashed border-dark-border flex items-center justify-center overflow-hidden transition-colors group-hover:border-green-primary cursor-pointer"
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-muted group-hover:text-green-primary transition-colors" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-green-primary uppercase tracking-wider mb-1">
                Foto de Perfil
              </label>
              <p className="text-gray-muted text-[10px] uppercase">
                Opcional • JPG, PNG (Max 5MB)
              </p>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold text-gray-muted uppercase tracking-wider"
                htmlFor="first_name"
              >
                Nombre
              </label>
              <input
                id="first_name"
                type="text"
                placeholder="Ej. Javier"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-dark-bg border-none focus:ring-1 focus:ring-green-primary rounded-lg text-white placeholder:text-gray-dim py-3 px-4 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold text-gray-muted uppercase tracking-wider"
                htmlFor="last_name"
              >
                Apellido
              </label>
              <input
                id="last_name"
                type="text"
                placeholder="Ej. Hernández"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-dark-bg border-none focus:ring-1 focus:ring-green-primary rounded-lg text-white placeholder:text-gray-dim py-3 px-4 transition-all outline-none"
              />
            </div>
          </div>

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
              className="w-full bg-dark-bg border-none focus:ring-1 focus:ring-green-primary rounded-lg text-white placeholder:text-gray-dim py-3 px-4 transition-all outline-none"
            />
          </div>

          {/* Password fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full bg-dark-bg border-none focus:ring-1 focus:ring-green-primary rounded-lg text-white placeholder:text-gray-dim py-3 px-4 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold text-gray-muted uppercase tracking-wider"
                htmlFor="confirm_password"
              >
                Confirmar
              </label>
              <input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-dark-bg border-none focus:ring-1 focus:ring-green-primary rounded-lg text-white placeholder:text-gray-dim py-3 px-4 transition-all outline-none"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start space-x-3 pt-2">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 rounded border-none bg-dark-bg text-green-primary focus:ring-green-primary transition-all accent-green-primary"
            />
            <label className="text-xs text-gray-muted leading-relaxed" htmlFor="terms">
              Acepto los{" "}
              <a className="text-green-primary hover:underline transition-all" href="#">
                Términos de Servicio
              </a>{" "}
              y la{" "}
              <a className="text-green-primary hover:underline transition-all" href="#">
                Política de Privacidad
              </a>{" "}
              de MundIAl 26.
            </label>
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
            {loading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
          </button>

          {/* Login link */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-muted uppercase tracking-widest">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-green-primary font-bold ml-1 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

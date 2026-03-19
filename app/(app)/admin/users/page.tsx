"use client";

import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, UserPlus, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: "admin" | "user";
  is_active: boolean;
  avatar_url: string | null;
}

interface UserStats {
  total: number;
  active_today: number;
  admins: number;
}

interface ApiResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  stats: UserStats;
}

const PAGE_LIMIT = 20;

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-green-primary font-bold text-sm">
      {initials}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, active_today: 0, admins: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit/Create sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "user" as "admin" | "user",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&limit=${PAGE_LIMIT}`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data: ApiResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  function openCreate() {
    setEditingUser(null);
    setFormData({ first_name: "", last_name: "", email: "", role: "user" });
    setFormError("");
    setSheetOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email,
      role: user.role,
    });
    setFormError("");
    setSheetOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError("");
    try {
      let res: Response;
      if (editingUser) {
        res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingUser.id, ...formData }),
        });
      } else {
        res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al guardar");
      }
      setSheetOpen(false);
      fetchUsers(page);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setDeleteTarget(null);
      fetchUsers(page);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(user: User) {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, is_active: !user.is_active }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      console.error(err);
    }
  }

  const fullName = (u: User) =>
    [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;

  return (
    <div>
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-none text-white">
            Gestión de{" "}
            <span className="text-green-primary">Usuarios</span>
          </h1>
          <p className="text-gray-muted font-medium tracking-tight">
            Control de acceso y roles de la plataforma administrativa.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-green-primary hover:bg-green-dim text-[#003918] font-bold text-xs px-6 py-4 rounded-lg flex items-center gap-2 shadow-[0px_10px_30px_rgba(0,212,106,0.2)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
        >
          <UserPlus size={16} />
          Nuevo Usuario
        </button>
      </header>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-dark-card rounded-xl overflow-hidden border-l-4 border-green-primary">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e1e1e]/50 border-b border-white/5">
                  <th className="px-6 py-5 text-gray-muted font-display tracking-widest text-base uppercase">
                    Avatar
                  </th>
                  <th className="px-6 py-5 text-gray-muted font-display tracking-widest text-base uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-5 text-gray-muted font-display tracking-widest text-base uppercase">
                    Email
                  </th>
                  <th className="px-6 py-5 text-gray-muted font-display tracking-widest text-base uppercase text-center">
                    Rol
                  </th>
                  <th className="px-6 py-5 text-gray-muted font-display tracking-widest text-base uppercase text-center">
                    Estado
                  </th>
                  <th className="px-6 py-5 text-gray-muted font-display tracking-widest text-base uppercase text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-full bg-dark-card-hover" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-dark-card-hover rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-48 bg-dark-card-hover rounded" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-5 w-14 bg-dark-card-hover rounded-full mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-6 w-11 bg-dark-card-hover rounded-full mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-8 w-20 bg-dark-card-hover rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-muted">
                      No hay usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-dark-card-hover transition-colors group"
                    >
                      {/* Avatar */}
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-primary/20 group-hover:border-green-primary transition-all">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={fullName(user)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback name={fullName(user)} />
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">{fullName(user)}</div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-gray-muted text-sm">{user.email}</td>

                      {/* Role badge */}
                      <td className="px-6 py-4 text-center">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold/10 text-gold rounded-full text-[10px] font-bold uppercase tracking-wider border border-gold/20">
                            <Shield size={10} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-[#2a2a2a] text-gray-muted rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/5">
                            User
                          </span>
                        )}
                      </td>

                      {/* Active toggle */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                            style={{
                              backgroundColor: user.is_active
                                ? "rgba(0,212,106,0.2)"
                                : "rgba(255,255,255,0.1)",
                            }}
                            aria-label={user.is_active ? "Desactivar" : "Activar"}
                          >
                            <span
                              className="inline-block h-4 w-4 transform rounded-full transition-transform"
                              style={{
                                backgroundColor: user.is_active ? "#00D46A" : "rgba(255,255,255,0.3)",
                                transform: user.is_active ? "translateX(24px)" : "translateX(4px)",
                              }}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 text-gray-muted hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-all"
                          aria-label="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-2 text-gray-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-[#2a2a2a]/30 px-6 py-4 flex items-center justify-between">
            <p className="text-gray-muted text-xs font-medium">
              Mostrando {users.length} de {total} usuarios
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-muted hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      page === p
                        ? "bg-green-primary text-[#003918]"
                        : "text-gray-muted hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-muted hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card p-6 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-primary/10 flex items-center justify-center text-green-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div className="text-gray-muted text-[10px] font-bold uppercase tracking-widest">
                Total Usuarios
              </div>
              <div className="font-display text-3xl text-white">{stats.total.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-dark-card p-6 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-primary/10 flex items-center justify-center text-green-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <div className="text-gray-muted text-[10px] font-bold uppercase tracking-widest">
                Activos Hoy
              </div>
              <div className="font-display text-3xl text-white">{stats.active_today.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-dark-card p-6 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-primary/10 flex items-center justify-center text-green-primary">
              <Shield size={24} />
            </div>
            <div>
              <div className="text-gray-muted text-[10px] font-bold uppercase tracking-widest">
                Admins
              </div>
              <div className="font-display text-3xl text-white">{stats.admins}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-dark-card border-dark-border text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight text-white">
              Eliminar usuario
            </DialogTitle>
            <DialogDescription className="text-gray-muted">
              ¿Eliminar a{" "}
              <span className="text-white font-semibold">
                {deleteTarget ? fullName(deleteTarget) : ""}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-dark-border text-gray-muted hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-dark-card border-dark-border text-white w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl tracking-tight text-white">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </SheetTitle>
            <SheetDescription className="text-gray-muted">
              {editingUser
                ? "Modifica los datos del usuario."
                : "Crea una nueva cuenta de usuario."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5 px-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-gray-muted text-xs uppercase tracking-widest font-bold">
                  Nombre
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData((f) => ({ ...f, first_name: e.target.value }))}
                  className="bg-[#0d0d0d] border-dark-border text-white"
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-gray-muted text-xs uppercase tracking-widest font-bold">
                  Apellido
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData((f) => ({ ...f, last_name: e.target.value }))}
                  className="bg-[#0d0d0d] border-dark-border text-white"
                  placeholder="García"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-muted text-xs uppercase tracking-widest font-bold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                className="bg-[#0d0d0d] border-dark-border text-white"
                placeholder="usuario@ejemplo.com"
                disabled={!!editingUser}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-muted text-xs uppercase tracking-widest font-bold">
                Rol
              </Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData((f) => ({ ...f, role: v as "admin" | "user" }))}
              >
                <SelectTrigger className="bg-[#0d0d0d] border-dark-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-border">
                  <SelectItem value="user" className="text-white">User</SelectItem>
                  <SelectItem value="admin" className="text-white">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <p className="text-red-400 text-sm">{formError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSheetOpen(false)}
                className="flex-1 border-dark-border text-gray-muted hover:text-white"
              >
                Cancelar
              </Button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-primary hover:bg-green-dim text-[#003918] font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 text-sm uppercase tracking-widest"
              >
                {saving ? "Guardando..." : editingUser ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

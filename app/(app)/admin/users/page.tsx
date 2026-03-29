"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  username: string | null;
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

function fullName(u: User) {
  return u.username || u.email;
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-[#42f183] font-bold text-sm">
      {initials}
    </div>
  );
}

// Dropdown menu for actions
function ActionsMenu({
  user,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-gray-500 hover:text-white transition-colors"
        aria-label="Actions"
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#1c1b1b] border border-white/10 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-[#2a2a2a] transition-colors text-left"
          >
            <span className="material-symbols-outlined text-base text-gray-400 leading-none">edit</span>
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onToggleStatus(); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-[#2a2a2a] transition-colors text-left"
          >
            <span className="material-symbols-outlined text-base text-gray-400 leading-none">
              {user.is_active ? "person_off" : "person"}
            </span>
            {user.is_active ? "Deactivate" : "Activate"}
          </button>
          <div className="border-t border-white/5" />
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-base leading-none">delete</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Invite modal
function InviteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [inviteLink] = useState(
    `${window.location.origin}/register?token=${crypto.randomUUID()}`
  );
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!email) return;
    setSending(true);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "user" }),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface-container-low w-full max-w-lg rounded-2xl shadow-2xl border border-white/5 p-8 relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bebas text-3xl text-white tracking-tight uppercase">
                Send Invitation
              </h3>
              <p className="text-gray-500 text-sm">
                A unique access link will be generated for the user.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. journalist@stadium.com"
                className="w-full bg-surface-container-highest border border-white/5 rounded-lg py-4 px-4 text-white focus:ring-1 focus:ring-primary outline-none placeholder-gray-600"
              />
            </div>

            <div className="p-4 bg-surface-container-highest rounded-xl border border-dashed border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                  Generated Link
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(inviteLink)}
                  className="text-primary hover:text-primary-container flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span className="text-[10px] font-bold uppercase">Copy</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 truncate">{inviteLink}</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-surface-container-highest text-white font-bold py-4 rounded-lg border border-white/5 hover:bg-[#3a3939] transition-colors uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !email}
                className="flex-1 bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold py-4 rounded-lg shadow-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit user modal
function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    username: user.username ?? "",
    role: user.role,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...formData }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error saving");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface-container-low w-full max-w-lg rounded-2xl shadow-2xl border border-white/5 p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bebas text-3xl text-white tracking-tight uppercase">Edit User</h3>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((f) => ({ ...f, username: e.target.value }))}
                className="w-full bg-surface-container-highest border border-white/5 rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value as "admin" | "user" }))}
                className="w-full bg-surface-container-highest border border-white/5 rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            <div className="flex gap-4 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-surface-container-highest text-white font-bold py-4 rounded-lg border border-white/5 hover:bg-[#3a3939] transition-colors uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold py-4 rounded-lg shadow-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation modal
function DeleteModal({
  user,
  onClose,
  onDeleted,
}: {
  user: User;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error deleting");
      onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface-container-low w-full max-w-md rounded-2xl shadow-2xl border border-white/5 p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bebas text-3xl text-white tracking-tight uppercase mb-2">Delete User</h3>
          <p className="text-gray-400 text-sm mb-6">
            Are you sure you want to delete{" "}
            <span className="text-white font-semibold">{fullName(user)}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-surface-container-highest text-white font-bold py-4 rounded-lg border border-white/5 hover:bg-[#3a3939] transition-colors uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-error text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&limit=${PAGE_LIMIT}`);
      if (!res.ok) throw new Error("Failed to load users");
      const data: ApiResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

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

  const filteredUsers = search
    ? users.filter(
        (u) =>
          fullName(u).toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="px-6 md:px-12 pt-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-bebas text-5xl md:text-7xl text-white tracking-tighter uppercase mb-2">
            User Directory
          </h2>
          <p className="text-gray-400 max-w-xl">
            Manage platform access, monitor participant engagement, and invite editorial contributors to the Mundial ecosystem.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold px-8 py-4 rounded-lg flex items-center gap-3 hover:scale-105 transition-transform duration-300 shadow-[0px_20px_40px_rgba(0,212,106,0.15)] group shrink-0"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-500">
            add
          </span>
          <span className="tracking-widest uppercase text-sm">Invite New User</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-[300px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or invite code..."
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-primary text-sm text-white placeholder-gray-600 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-surface-container-high px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/5 hover:bg-surface-container-highest transition-colors text-white">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Status
          </button>
          <button className="bg-surface-container-high px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/5 hover:bg-surface-container-highest transition-colors text-white">
            <span className="material-symbols-outlined text-sm">sort</span>
            Date Joined
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
              <th className="pb-6 pl-4">User Details</th>
              <th className="pb-6">Games</th>
              <th className="pb-6">Role</th>
              <th className="pb-6">Status</th>
              <th className="pb-6">Invite Code</th>
              <th className="pb-6 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-6 pl-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high" />
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-surface-container-high rounded" />
                        <div className="h-2 w-24 bg-surface-container-high rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-6"><div className="h-6 w-8 bg-surface-container-high rounded" /></td>
                  <td className="py-6"><div className="h-5 w-16 bg-surface-container-high rounded-full" /></td>
                  <td className="py-6"><div className="h-4 w-14 bg-surface-container-high rounded" /></td>
                  <td className="py-6"><div className="h-4 w-20 bg-surface-container-high rounded" /></td>
                  <td className="py-6 pr-4 text-right"><div className="h-6 w-6 bg-surface-container-high rounded ml-auto" /></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const name = fullName(user);
                const isAdmin = user.role === "admin";
                return (
                  <tr
                    key={user.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    {/* User details */}
                    <td className="py-6 pl-4">
                      <div className={`flex items-center gap-4 ${!user.is_active ? "opacity-50" : ""}`}>
                        <div
                          className={`w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 ${
                            isAdmin ? "border-primary/20" : "border-white/10"
                          }`}
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback name={name} />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Games count — placeholder since API doesn't return this */}
                    <td className="py-6">
                      <span className={`font-bebas text-2xl tracking-tight ${user.is_active ? "text-white" : "text-gray-600"}`}>
                        —
                      </span>
                    </td>

                    {/* Role badge */}
                    <td className="py-6">
                      {isAdmin ? (
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-primary/20">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
                          User
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.is_active ? "bg-primary" : "bg-gray-600"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            user.is_active ? "text-on-surface" : "text-gray-600"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Invite code — placeholder */}
                    <td className="py-6">
                      <code className="text-xs bg-surface-container-high px-2 py-1 rounded border border-white/5 text-gray-400">
                        WC26-{user.id.slice(0, 4).toUpperCase()}
                      </code>
                    </td>

                    {/* Actions */}
                    <td className="py-6 pr-4 text-right">
                      <ActionsMenu
                        user={user}
                        onEdit={() => setEditingUser(user)}
                        onDelete={() => setDeleteTarget(user)}
                        onToggleStatus={() => handleToggleActive(user)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-gray-500 text-xs font-medium">
            Showing {users.length} of {total} users
          </p>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-gray-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  page === p
                    ? "bg-primary text-on-primary"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-gray-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => fetchUsers(page)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => fetchUsers(page)}
        />
      )}
    </div>
  );
}

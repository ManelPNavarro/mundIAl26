"use client";

import { useState } from "react";
import type { Tables } from "@/types/database";

type Competition = Tables<"competitions">;

type CompetitionStatus = "upcoming" | "active" | "finished";

interface Props {
  initialCompetitions: Competition[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function StatusBadge({ status }: { status: CompetitionStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
        Active
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-gray-400 text-[9px] font-bold tracking-widest uppercase">
        Finished
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[9px] font-bold tracking-widest uppercase">
      Upcoming
    </span>
  );
}

function SmallGameCard({
  competition,
  onEdit,
  onDelete,
}: {
  competition: Competition;
  onEdit: (c: Competition) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 border border-white/5 transition-all hover:bg-surface-container-high relative">
      <div className="flex justify-between items-start mb-6">
        <StatusBadge status={competition.status as CompetitionStatus} />
        <button
          onClick={() => onEdit(competition)}
          className="text-gray-500 hover:text-white transition-colors"
          title="More options"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-surface-container-highest rounded-lg flex items-center justify-center border border-white/5 shrink-0">
          {competition.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={competition.logo_url}
              alt={competition.name}
              className="w-10 h-10 object-contain opacity-80"
            />
          ) : (
            <span className="material-symbols-outlined text-gray-500 text-2xl">emoji_events</span>
          )}
        </div>
        <div>
          <h4 className="font-bebas text-2xl text-white leading-tight">{competition.name}</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{competition.season}</p>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest">API Code</p>
          <p className="font-mono text-sm text-white">{competition.api_competition_code}</p>
        </div>
        <div className="flex gap-1">
          {competition.status === "finished" ? (
            <>
              <button className="p-2 text-gray-500 hover:text-primary transition-colors" title="View">
                <span className="material-symbols-outlined text-xl">visibility</span>
              </button>
              <button className="p-2 text-gray-500 hover:text-primary transition-colors" title="Analytics">
                <span className="material-symbols-outlined text-xl">analytics</span>
              </button>
            </>
          ) : competition.status === "upcoming" ? (
            <>
              <button
                onClick={() => onEdit(competition)}
                className="p-2 text-gray-500 hover:text-primary transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
              <button className="p-2 text-gray-500 hover:text-primary transition-colors" title="Campaign">
                <span className="material-symbols-outlined text-xl">campaign</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(competition)}
                className="p-2 text-gray-500 hover:text-primary transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
              <button className="p-2 text-gray-500 hover:text-primary transition-colors" title="Settings">
                <span className="material-symbols-outlined text-xl">settings_suggest</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ModalForm {
  id?: string;
  name: string;
  slug: string;
  api_competition_code: string;
  season: string;
  status: CompetitionStatus;
  predictions_deadline: string;
  logo_url: string;
}

const EMPTY_FORM: ModalForm = {
  name: "",
  slug: "",
  api_competition_code: "",
  season: "",
  status: "upcoming",
  predictions_deadline: "",
  logo_url: "",
};

export default function GamesClient({ initialCompetitions }: Props) {
  const [competitions, setCompetitions] = useState<Competition[]>(initialCompetitions);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ModalForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const featuredCompetition = competitions.find((c) => c.status === "active") ?? competitions[0] ?? null;
  const otherCompetitions = featuredCompetition
    ? competitions.filter((c) => c.id !== featuredCompetition.id)
    : competitions.slice(1);

  const activeCount = competitions.filter((c) => c.status === "active").length;

  function openCreate() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(competition: Competition) {
    setForm({
      id: competition.id,
      name: competition.name,
      slug: competition.slug,
      api_competition_code: competition.api_competition_code,
      season: competition.season,
      status: competition.status as CompetitionStatus,
      predictions_deadline: competition.predictions_deadline
        ? competition.predictions_deadline.slice(0, 16)
        : "",
      logo_url: competition.logo_url ?? "",
    });
    setModalOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: f.id ? f.slug : slugify(name),
    }));
  }

  async function handleSave() {
    if (!form.name || !form.slug || !form.api_competition_code || !form.season) return;
    setSaving(true);
    try {
      const payload = {
        id: form.id,
        name: form.name,
        slug: form.slug,
        api_competition_code: form.api_competition_code,
        season: form.season,
        status: form.status,
        predictions_deadline: form.predictions_deadline
          ? new Date(form.predictions_deadline).toISOString()
          : new Date().toISOString(),
        logo_url: form.logo_url || null,
      };

      if (form.id) {
        const res = await fetch("/api/admin/competitions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");
        const data = await res.json();
        setCompetitions((prev) =>
          prev.map((c) => (c.id === data.competition.id ? data.competition : c))
        );
      } else {
        const res = await fetch("/api/admin/competitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        const data = await res.json();
        setCompetitions((prev) => [data.competition, ...prev]);
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin/competitions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCompetitions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-6 pt-10">
        <div>
          <h1 className="font-bebas text-5xl md:text-7xl text-white leading-none tracking-tight">
            GAMES MANAGEMENT
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Configure and monitor independent tournament ecosystems.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-lg text-sm tracking-widest uppercase hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          CREATE NEW GAME
        </button>
      </div>

      {/* Dashboard Grid (Asymmetric Bento) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 px-6 pb-20">
        {/* Featured/Active Game Card */}
        {featuredCompetition ? (
          <div className="md:col-span-8 group relative overflow-hidden bg-surface-container-low rounded-xl p-8 border border-white/5 transition-all hover:bg-surface-container-high">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex flex-col md:flex-row justify-between gap-8 h-full">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse" />
                    {featuredCompetition.status === "active" ? "Active" : featuredCompetition.status}
                  </span>
                  <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                    {featuredCompetition.api_competition_code}
                  </span>
                </div>
                <h3 className="font-bebas text-4xl text-white mb-2">{featuredCompetition.name}</h3>
                <p className="text-gray-400 text-sm max-w-md mb-8">
                  {featuredCompetition.season} · Slug: {featuredCompetition.slug}
                </p>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Season</p>
                    <p className="font-bebas text-2xl text-white">{featuredCompetition.season}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                    <p className="font-bebas text-2xl text-white capitalize">{featuredCompetition.status}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                <div className="w-32 h-32 bg-surface-container-highest rounded-xl flex items-center justify-center border border-white/5">
                  {featuredCompetition.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredCompetition.logo_url}
                      alt={featuredCompetition.name}
                      className="w-20 h-20 object-contain opacity-80"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-gray-500 text-5xl">emoji_events</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => openEdit(featuredCompetition)}
                    className="p-3 bg-surface-container-highest text-white rounded-lg hover:text-primary transition-colors border border-white/5"
                    title="Edit Game"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    className="p-3 bg-surface-container-highest text-white rounded-lg hover:text-primary transition-colors border border-white/5"
                    title="Configure Scoring"
                  >
                    <span className="material-symbols-outlined">settings_suggest</span>
                  </button>
                  <button
                    onClick={() => handleDelete(featuredCompetition.id)}
                    disabled={deleteId === featuredCompetition.id}
                    className="p-3 bg-surface-container-highest text-error rounded-lg hover:bg-error/10 transition-colors border border-white/5 disabled:opacity-50"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 border border-white/5 flex items-center justify-center">
            <p className="text-gray-500 font-bebas text-2xl tracking-widest">NO COMPETITIONS YET</p>
          </div>
        )}

        {/* Network Overview Card */}
        <div className="md:col-span-4 bg-surface-container-low rounded-xl p-8 border border-white/5 flex flex-col justify-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-4">Network Overview</p>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-sm text-on-surface">Total Managed Games</span>
              <span className="font-bebas text-2xl text-white">
                {String(competitions.length).padStart(2, "0")}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-sm text-on-surface">Active Tournaments</span>
              <span className="font-bebas text-2xl text-primary">
                {String(activeCount).padStart(2, "0")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface">Avg. User Retention</span>
              <span className="font-bebas text-2xl text-secondary">—</span>
            </div>
          </div>
        </div>

        {/* Smaller Game Cards */}
        {otherCompetitions.map((competition) => (
          <SmallGameCard
            key={competition.id}
            competition={competition}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}

        {/* Empty State / Add New */}
        <div
          onClick={openCreate}
          className="md:col-span-12 border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center group hover:border-primary/40 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-3xl">
              add_circle
            </span>
          </div>
          <p className="font-bebas text-xl text-gray-500 group-hover:text-white transition-colors tracking-widest">
            Draft New Tournament Ecosystem
          </p>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-surface-container-low rounded-2xl p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bebas text-3xl text-white tracking-tight">
                {form.id ? "EDIT GAME" : "CREATE NEW GAME"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="World Cup 2026"
                  className="w-full bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">
                  Slug (auto-generated)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="world-cup-2026"
                  className="w-full bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              {/* API Competition Code */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">
                  API Competition Code
                </label>
                <input
                  type="text"
                  value={form.api_competition_code}
                  onChange={(e) => setForm((f) => ({ ...f, api_competition_code: e.target.value }))}
                  placeholder="WC"
                  className="w-full bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              {/* Season */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">
                  Season
                </label>
                <input
                  type="text"
                  value={form.season}
                  onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
                  placeholder="2026"
                  className="w-full bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Predictions Deadline */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">
                  Predictions Deadline
                </label>
                <input
                  type="datetime-local"
                  value={form.predictions_deadline}
                  onChange={(e) => setForm((f) => ({ ...f, predictions_deadline: e.target.value }))}
                  className="w-full bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as CompetitionStatus }))
                  }
                  className="w-full bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-surface-container-high text-white font-bold py-4 rounded-lg uppercase tracking-widest text-sm hover:bg-surface-container-highest transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.slug || !form.api_competition_code || !form.season}
                className="flex-1 editorial-gradient text-on-primary-fixed font-bold py-4 rounded-lg uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {saving ? "Saving..." : form.id ? "Save Changes" : "Create Game"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

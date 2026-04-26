"use client";

import { useState, useEffect, useRef } from "react";
import { generateSlug, parseTags } from "@/lib/art-utils";
import { Field, Input, Textarea } from "./FormField";
import type { ArtArtist, ArtWave } from "@/lib/types-art";

// ─── Modal shell ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Quick-create Artist ──────────────────────────────────────────────────────

interface QuickArtistProps {
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  waves: ArtWave[];
  onCreated: (artist: ArtArtist) => void;
  onClose: () => void;
}

export function QuickCreateArtist({ adminFetch, waves, onCreated, onClose }: QuickArtistProps) {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [died, setDied] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [selectedWaveIds, setSelectedWaveIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  function toggleWave(id: string) {
    setSelectedWaveIds(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name,
      slug: generateSlug(name),
      born: born ? parseInt(born) : null,
      died: died ? parseInt(died) : null,
      short_bio: shortBio,
      tags: [],
      featured: false,
      published: true,
      wave_ids: selectedWaveIds,
    };
    try {
      const res = await adminFetch("/api/admin/art-artists", { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create artist");
      onCreated(data as ArtArtist);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create artist");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Quick-add Artist" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" required>
          <Input ref={firstRef} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Mykhailo Boichuk" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Born (year)">
            <Input type="number" value={born} onChange={e => setBorn(e.target.value)} placeholder="1882" min="1200" max="2020" />
          </Field>
          <Field label="Died (year)">
            <Input type="number" value={died} onChange={e => setDied(e.target.value)} placeholder="1937" min="1200" max="2100" />
          </Field>
        </div>
        <Field label="Short bio" required hint="1–3 sentences">
          <Textarea value={shortBio} onChange={e => setShortBio(e.target.value)} rows={3} required />
        </Field>
        {waves.length > 0 && (
          <Field label="Art movements">
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {waves.map(wave => (
                <label key={wave.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedWaveIds.includes(wave.id)}
                    onChange={() => toggleWave(wave.id)}
                    className="rounded border-gray-300"
                  />
                  {wave.name}{wave.period ? ` (${wave.period})` : ""}
                </label>
              ))}
            </div>
          </Field>
        )}
        {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-60"
            style={{ backgroundColor: "#003399" }}
          >
            {saving ? "Creating…" : "Create Artist"}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:underline">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Quick-create Art Wave ────────────────────────────────────────────────────

interface QuickWaveProps {
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  onCreated: (wave: ArtWave) => void;
  onClose: () => void;
}

export function QuickCreateWave({ adminFetch, onCreated, onClose }: QuickWaveProps) {
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name,
      slug: generateSlug(name),
      period: period || null,
      start_year: startYear ? parseInt(startYear) : null,
      end_year: endYear ? parseInt(endYear) : null,
      description,
      tags: [],
      published: true,
    };
    try {
      const res = await adminFetch("/api/admin/art-waves", { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create wave");
      onCreated(data as ArtWave);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create wave");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Quick-add Movement" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" required>
          <Input ref={firstRef} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Ukrainian Avant-Garde" />
        </Field>
        <Field label="Period label" hint='e.g. "1910s–1930s"'>
          <Input value={period} onChange={e => setPeriod(e.target.value)} placeholder="1910s–1930s" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start year">
            <Input type="number" value={startYear} onChange={e => setStartYear(e.target.value)} placeholder="1910" min="100" max="2100" />
          </Field>
          <Field label="End year">
            <Input type="number" value={endYear} onChange={e => setEndYear(e.target.value)} placeholder="1934" min="100" max="2100" />
          </Field>
        </div>
        <Field label="Short description" required>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
        </Field>
        {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-60"
            style={{ backgroundColor: "#003399" }}
          >
            {saving ? "Creating…" : "Create Movement"}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:underline">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

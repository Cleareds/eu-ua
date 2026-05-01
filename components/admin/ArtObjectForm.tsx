"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSlug, parseTags, formatTags } from "@/lib/art-utils";
import { Field, Input, Textarea, Select, CheckboxField, FormSection, SaveButton, Toast } from "./FormField";
import ImageUpload from "./ImageUpload";
import { QuickCreateArtist, QuickCreateWave } from "./QuickCreate";
import type { ArtObject, ArtArtist, ArtWave } from "@/lib/types-art";

interface Props {
  initial?: ArtObject & { wave_ids?: string[] };
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
}

export default function ArtObjectForm({ initial, adminFetch }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [artists, setArtists] = useState<ArtArtist[]>([]);
  const [waves, setWaves] = useState<ArtWave[]>([]);
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [showWaveModal, setShowWaveModal] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [titleUk, setTitleUk] = useState(initial?.title_uk ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [artistId, setArtistId] = useState(initial?.artist_id ?? "");
  const [selectedWaveIds, setSelectedWaveIds] = useState<string[]>(
    initial?.wave_ids ?? (initial?.wave_id ? [initial.wave_id] : [])
  );
  const [year, setYear] = useState(initial?.year?.toString() ?? "");
  const [medium, setMedium] = useState(initial?.medium ?? "");
  const [dimensions, setDimensions] = useState(initial?.dimensions ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.short_description ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.full_description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [tags, setTags] = useState(formatTags(initial?.tags ?? []));
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);

  const [slugTouched, setSlugTouched] = useState(!!initial);
  useEffect(() => {
    if (!slugTouched && title) setSlug(generateSlug(title));
  }, [title, slugTouched]);

  useEffect(() => {
    Promise.all([
      adminFetch("/api/admin/art-artists").then(r => r.json()),
      adminFetch("/api/admin/art-waves").then(r => r.json()),
    ]).then(([a, w]) => {
      if (Array.isArray(a)) setArtists(a);
      if (Array.isArray(w)) setWaves(w);
    });
  }, [adminFetch]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function onArtistCreated(artist: ArtArtist) {
    setArtists(prev => [...prev, artist].sort((a, b) => (a.born ?? 9999) - (b.born ?? 9999)));
    setArtistId(artist.id);
    showToast(`Artist "${artist.name}" created and selected`, "success");
  }

  function onWaveCreated(wave: ArtWave) {
    setWaves(prev => [...prev, wave].sort((a, b) => (a.start_year ?? 9999) - (b.start_year ?? 9999)));
    setSelectedWaveIds(prev => prev.includes(wave.id) ? prev : [...prev, wave.id]);
    showToast(`Wave "${wave.name}" created and selected`, "success");
  }

  function toggleWave(id: string) {
    setSelectedWaveIds(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  }

  function makeWavePrimary(id: string) {
    setSelectedWaveIds(prev => {
      if (!prev.includes(id)) return prev;
      return [id, ...prev.filter(w => w !== id)];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title, title_uk: titleUk || null, slug,
      artist_id: artistId || null,
      wave_id: selectedWaveIds[0] ?? null,
      wave_ids: selectedWaveIds,
      year: year ? parseInt(year) : null,
      medium: medium || null, dimensions: dimensions || null, location: location || null,
      short_description: shortDescription, full_description: fullDescription || null,
      image_url: imageUrl || null,
      tags: parseTags(tags), featured, published,
    };
    const url = initial ? `/api/admin/art-objects/${initial.id}` : "/api/admin/art-objects";
    const method = initial ? "PUT" : "POST";
    try {
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showToast(initial ? "Art object updated!" : "Art object created!", "success");
      setTimeout(() => router.push("/admin/art"), 1200);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {showArtistModal && (
        <QuickCreateArtist
          adminFetch={adminFetch}
          waves={waves}
          onCreated={onArtistCreated}
          onClose={() => setShowArtistModal(false)}
        />
      )}
      {showWaveModal && (
        <QuickCreateWave
          adminFetch={adminFetch}
          onCreated={onWaveCreated}
          onClose={() => setShowWaveModal(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {toast && <Toast message={toast.msg} type={toast.type} />}

        <FormSection title="Title">
          <Field label="Title (English)" required>
            <Input value={title} onChange={e => setTitle(e.target.value)} required />
          </Field>
          <Field label="Title (Ukrainian)">
            <Input value={titleUk} onChange={e => setTitleUk(e.target.value)} />
          </Field>
          <Field label="Slug" hint="URL identifier — auto-generated, editable">
            <Input value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }} required pattern="[a-z0-9-]+" />
          </Field>
        </FormSection>

        <FormSection title="Attribution">
          <Field label="Artist">
            <div className="flex gap-2">
              <Select value={artistId} onChange={e => setArtistId(e.target.value)} className="flex-1">
                <option value="">— No artist —</option>
                {artists.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}{a.born ? ` (${a.born}${a.died ? `–${a.died}` : ""})` : ""}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => setShowArtistModal(true)}
                className="shrink-0 px-3 py-2 text-sm rounded border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
                title="Create new artist"
              >
                + New
              </button>
            </div>
          </Field>
          <Field label="Art Movements" hint="Select one or more. The first selected is the primary movement shown on cards.">
            <div className="space-y-2">
              {waves.length === 0 ? (
                <p className="text-xs text-gray-400">No movements yet — create one below.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto border border-gray-100 rounded p-2">
                  {waves.map(w => {
                    const checked = selectedWaveIds.includes(w.id);
                    const isPrimary = checked && selectedWaveIds[0] === w.id;
                    return (
                      <div key={w.id} className="flex items-center gap-2 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleWave(w.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="truncate">
                            {w.name}{w.period ? ` (${w.period})` : ""}
                          </span>
                        </label>
                        {checked && (
                          isPrimary ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0" style={{ backgroundColor: "#FFD700", color: "#003399" }}>
                              Primary
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => makeWavePrimary(w.id)}
                              className="text-[10px] text-gray-500 hover:underline shrink-0"
                              title="Make this the primary movement"
                            >
                              Make primary
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowWaveModal(true)}
                className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                + New movement
              </button>
            </div>
          </Field>
        </FormSection>

        <FormSection title="Artwork details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year created">
              <Input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="1921" min="1200" max="2030" />
            </Field>
            <Field label="Medium" hint='e.g. "Oil on canvas"'>
              <Input value={medium} onChange={e => setMedium(e.target.value)} placeholder="Oil on canvas" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dimensions" hint='e.g. "120 × 80 cm"'>
              <Input value={dimensions} onChange={e => setDimensions(e.target.value)} placeholder="120 × 80 cm" />
            </Field>
            <Field label="Current location">
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="National Art Museum of Ukraine, Kyiv" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Content">
          <Field label="Short description" hint="1–2 sentences shown on cards">
            <Textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={3} />
          </Field>
          <Field label="Full description" hint="Markdown supported — detailed curatorial text shown on the artwork page">
            <Textarea value={fullDescription} onChange={e => setFullDescription(e.target.value)} rows={12} className="font-mono text-xs" />
          </Field>
        </FormSection>

        <FormSection title="Image">
          <Field label="Artwork image">
            <ImageUpload value={imageUrl} onChange={setImageUrl} folder="objects" adminFetch={adminFetch} />
          </Field>
        </FormSection>

        <FormSection title="Tags & Visibility">
          <Field label="Tags" hint="Comma-separated: e.g. avant-garde, portrait, 1920s">
            <Input value={tags} onChange={e => setTags(e.target.value)} />
          </Field>
          <CheckboxField label="Featured (shown prominently on the Art entry page)" checked={featured} onChange={e => setFeatured(e.target.checked)} />
          <CheckboxField label="Published (visible on site)" checked={published} onChange={e => setPublished(e.target.checked)} />
        </FormSection>

        <div className="flex gap-3 pt-2">
          <SaveButton loading={saving} />
          <button type="button" onClick={() => router.push("/admin/art")} className="px-4 py-2 text-sm text-gray-600 hover:underline">
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSlug, parseTags, formatTags } from "@/lib/art-utils";
import { Field, Input, Textarea, CheckboxField, FormSection, SaveButton, Toast } from "./FormField";
import ImageUpload from "./ImageUpload";
import type { ArtArtist, ArtWave } from "@/lib/types-art";

interface Props {
  initial?: ArtArtist & { wave_ids?: string[] };
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
}

export default function ArtistForm({ initial, adminFetch }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [allWaves, setAllWaves] = useState<ArtWave[]>([]);

  const [name, setName] = useState(initial?.name ?? "");
  const [nameUk, setNameUk] = useState(initial?.name_uk ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [born, setBorn] = useState(initial?.born?.toString() ?? "");
  const [died, setDied] = useState(initial?.died?.toString() ?? "");
  const [birthPlace, setBirthPlace] = useState(initial?.birth_place ?? "");
  const [shortBio, setShortBio] = useState(initial?.short_bio ?? "");
  const [fullBio, setFullBio] = useState(initial?.full_bio ?? "");
  const [profileImage, setProfileImage] = useState(initial?.profile_image_url ?? "");
  const [tags, setTags] = useState(formatTags(initial?.tags ?? []));
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [selectedWaveIds, setSelectedWaveIds] = useState<string[]>(initial?.wave_ids ?? []);

  const [slugTouched, setSlugTouched] = useState(!!initial);
  useEffect(() => {
    if (!slugTouched && name) setSlug(generateSlug(name));
  }, [name, slugTouched]);

  useEffect(() => {
    adminFetch("/api/admin/art-waves").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setAllWaves(d);
    });
  }, [adminFetch]);

  function toggleWave(id: string) {
    setSelectedWaveIds(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name, name_uk: nameUk || null, slug,
      born: born ? parseInt(born) : null,
      died: died ? parseInt(died) : null,
      birth_place: birthPlace || null,
      short_bio: shortBio, full_bio: fullBio || null,
      profile_image_url: profileImage || null,
      tags: parseTags(tags), featured, published,
      wave_ids: selectedWaveIds,
    };
    const url = initial ? `/api/admin/art-artists/${initial.id}` : "/api/admin/art-artists";
    const method = initial ? "PUT" : "POST";
    try {
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showToast(initial ? "Artist updated!" : "Artist created!", "success");
      setTimeout(() => router.push("/admin/artists"), 1200);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <FormSection title="Identity">
        <Field label="Full name (English)" required>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Full name (Ukrainian)">
          <Input value={nameUk} onChange={e => setNameUk(e.target.value)} />
        </Field>
        <Field label="Slug" hint="URL identifier — auto-generated, editable">
          <Input value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }} required pattern="[a-z0-9-]+" />
        </Field>
      </FormSection>

      <FormSection title="Biographical details">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Born (year)">
            <Input type="number" value={born} onChange={e => setBorn(e.target.value)} placeholder="1882" min="1200" max="2020" />
          </Field>
          <Field label="Died (year)" hint="Leave blank if still alive">
            <Input type="number" value={died} onChange={e => setDied(e.target.value)} placeholder="1937" min="1200" max="2100" />
          </Field>
        </div>
        <Field label="Birth place">
          <Input value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="Ternopil Oblast, Ukraine" />
        </Field>
      </FormSection>

      <FormSection title="Content">
        <Field label="Short bio" required hint="1–3 sentences shown on cards and listings">
          <Textarea value={shortBio} onChange={e => setShortBio(e.target.value)} rows={3} required />
        </Field>
        <Field label="Full biography" hint="Markdown supported — shown on artist's detail page">
          <Textarea value={fullBio} onChange={e => setFullBio(e.target.value)} rows={12} className="font-mono text-xs" />
        </Field>
      </FormSection>

      <FormSection title="Art Movements">
        {allWaves.length === 0 ? (
          <p className="text-xs text-gray-400">No art waves yet — create some first.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {allWaves.map(wave => (
              <label key={wave.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedWaveIds.includes(wave.id)}
                  onChange={() => toggleWave(wave.id)}
                  className="rounded border-gray-300"
                />
                <span>{wave.name}</span>
                {wave.period && <span className="text-xs text-gray-400">({wave.period})</span>}
              </label>
            ))}
          </div>
        )}
      </FormSection>

      <FormSection title="Media & Tags">
        <Field label="Profile photo">
          <ImageUpload value={profileImage} onChange={setProfileImage} folder="artists" adminFetch={adminFetch} />
        </Field>
        <Field label="Tags" hint="Comma-separated: e.g. modernism, lviv, graphic-arts">
          <Input value={tags} onChange={e => setTags(e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Visibility">
        <CheckboxField label="Featured (shown prominently on the Art entry page)" checked={featured} onChange={e => setFeatured(e.target.checked)} />
        <CheckboxField label="Published (visible on site)" checked={published} onChange={e => setPublished(e.target.checked)} />
      </FormSection>

      <div className="flex gap-3 pt-2">
        <SaveButton loading={saving} />
        <button type="button" onClick={() => router.push("/admin/artists")} className="px-4 py-2 text-sm text-gray-600 hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}

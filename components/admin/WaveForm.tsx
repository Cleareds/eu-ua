"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSlug, parseTags, formatTags } from "@/lib/art-utils";
import { Field, Input, Textarea, CheckboxField, FormSection, SaveButton, Toast } from "./FormField";
import ImageUpload from "./ImageUpload";
import type { ArtWave } from "@/lib/types-art";

interface Props {
  initial?: ArtWave;
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
}

export default function WaveForm({ initial, adminFetch }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [nameUk, setNameUk] = useState(initial?.name_uk ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [period, setPeriod] = useState(initial?.period ?? "");
  const [startYear, setStartYear] = useState(initial?.start_year?.toString() ?? "");
  const [endYear, setEndYear] = useState(initial?.end_year?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.full_description ?? "");
  const [coverImage, setCoverImage] = useState(initial?.cover_image_url ?? "");
  const [tags, setTags] = useState(formatTags(initial?.tags ?? []));
  const [published, setPublished] = useState(initial?.published ?? true);

  // Auto-slug from name (only if user hasn't manually edited slug)
  const [slugTouched, setSlugTouched] = useState(!!initial);
  useEffect(() => {
    if (!slugTouched && name) setSlug(generateSlug(name));
  }, [name, slugTouched]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name, name_uk: nameUk || null, slug, period: period || null,
      start_year: startYear ? parseInt(startYear) : null,
      end_year: endYear ? parseInt(endYear) : null,
      description, full_description: fullDescription || null,
      cover_image_url: coverImage || null,
      tags: parseTags(tags), published,
    };
    const url = initial ? `/api/admin/art-waves/${initial.id}` : "/api/admin/art-waves";
    const method = initial ? "PUT" : "POST";
    try {
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showToast(initial ? "Wave updated!" : "Wave created!", "success");
      setTimeout(() => router.push("/admin/waves"), 1200);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <FormSection title="Basic info">
        <Field label="Name (English)" required>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Name (Ukrainian)">
          <Input value={nameUk} onChange={e => setNameUk(e.target.value)} />
        </Field>
        <Field label="Slug" hint="URL identifier — auto-generated from name, editable">
          <Input
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
            required
            pattern="[a-z0-9-]+"
          />
        </Field>
      </FormSection>

      <FormSection title="Period">
        <Field label="Period label" hint='e.g. "1910s–1930s"'>
          <Input value={period} onChange={e => setPeriod(e.target.value)} placeholder="1920s–1940s" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start year">
            <Input type="number" value={startYear} onChange={e => setStartYear(e.target.value)} placeholder="1910" min="100" max="2100" />
          </Field>
          <Field label="End year" hint="Leave blank if ongoing">
            <Input type="number" value={endYear} onChange={e => setEndYear(e.target.value)} placeholder="1935" min="100" max="2100" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Content">
        <Field label="Short description" required hint="Shown on listing cards (1–2 sentences)">
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
        </Field>
        <Field label="Full description" hint="Markdown supported — shown on the wave's detail page">
          <Textarea value={fullDescription} onChange={e => setFullDescription(e.target.value)} rows={10} className="font-mono text-xs" />
        </Field>
      </FormSection>

      <FormSection title="Media & Tags">
        <Field label="Cover image">
          <ImageUpload value={coverImage} onChange={setCoverImage} folder="waves" adminFetch={adminFetch} />
        </Field>
        <Field label="Tags" hint="Comma-separated: e.g. avant-garde, modernism, kyiv">
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="avant-garde, modernism" />
        </Field>
      </FormSection>

      <FormSection title="Visibility">
        <CheckboxField label="Published (visible on site)" checked={published} onChange={e => setPublished(e.target.checked)} />
      </FormSection>

      <div className="flex gap-3 pt-2">
        <SaveButton loading={saving} />
        <button type="button" onClick={() => router.push("/admin/waves")} className="px-4 py-2 text-sm text-gray-600 hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}

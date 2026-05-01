"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/art-utils";
import { Field, Input, Textarea, Select, CheckboxField, FormSection, SaveButton, Toast } from "./FormField";
import ImageUpload from "./ImageUpload";
import type { PersonRecord, PersonSource } from "@/lib/types";

interface Props {
  initial?: PersonRecord;
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
}

const ERA_OPTIONS = [
  { value: "", label: "— Select era —" },
  { value: "medieval", label: "Medieval" },
  { value: "early-modern", label: "Early Modern" },
  { value: "national-awakening", label: "19th Century / National Awakening" },
  { value: "19th-century", label: "19th Century" },
  { value: "20th-century", label: "20th Century" },
  { value: "modern", label: "Modern" },
];

export default function PersonForm({ initial, adminFetch }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [years, setYears] = useState(initial?.years ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [birthplace, setBirthplace] = useState(initial?.birthplace ?? "");
  const [era, setEra] = useState(initial?.era ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [connections, setConnections] = useState<string[]>(
    initial?.european_connections?.length ? initial.european_connections : [""]
  );
  const [sources, setSources] = useState<PersonSource[]>(
    initial?.sources?.length ? initial.sources : [{ title: "", url: "" }]
  );
  const [profileImage, setProfileImage] = useState(initial?.profile_image_url ?? "");
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order?.toString() ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);

  const [slugTouched, setSlugTouched] = useState(!!initial);
  useEffect(() => {
    if (!slugTouched && name) setSlug(generateSlug(name));
  }, [name, slugTouched]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function updateConnection(idx: number, value: string) {
    setConnections(prev => prev.map((c, i) => (i === idx ? value : c)));
  }
  function addConnection() { setConnections(prev => [...prev, ""]); }
  function removeConnection(idx: number) {
    setConnections(prev => prev.filter((_, i) => i !== idx));
  }

  function updateSource(idx: number, key: keyof PersonSource, value: string) {
    setSources(prev => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  }
  function addSource() { setSources(prev => [...prev, { title: "", url: "" }]); }
  function removeSource(idx: number) {
    setSources(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      slug,
      years: years || null,
      role: role || null,
      birthplace: birthplace || null,
      era: era || null,
      description,
      european_connections: connections.map(c => c.trim()).filter(Boolean),
      sources: sources.filter(s => s.title.trim() && s.url.trim()),
      profile_image_url: profileImage || null,
      display_order: displayOrder ? parseInt(displayOrder) : null,
      featured,
      published,
    };
    const url = initial ? `/api/admin/people/${initial.id}` : "/api/admin/people";
    const method = initial ? "PUT" : "POST";
    try {
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showToast(initial ? "Person updated!" : "Person created!", "success");
      setTimeout(() => router.push("/admin/people"), 1200);
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
        <Field label="Name" required>
          <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Yaroslav the Wise" />
        </Field>
        <Field label="Slug" hint="URL identifier — auto-generated, editable">
          <Input value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }} required pattern="[a-z0-9-]+" />
        </Field>
        <Field label="Role / title">
          <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Grand Prince of Kyiv" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Years" hint='Free-form e.g. "c. 978–1054"'>
            <Input value={years} onChange={e => setYears(e.target.value)} placeholder="1814–1861" />
          </Field>
          <Field label="Era">
            <Select value={era} onChange={e => setEra(e.target.value)}>
              {ERA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Birthplace">
          <Input value={birthplace} onChange={e => setBirthplace(e.target.value)} placeholder="Kyiv" />
        </Field>
      </FormSection>

      <FormSection title="Description">
        <Field label="Description" hint="A few paragraphs introducing the person">
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} />
        </Field>
      </FormSection>

      <FormSection title="European Connections">
        <p className="text-xs text-gray-500">One connection per line — shown as a bulleted list on the person card.</p>
        <div className="space-y-2">
          {connections.map((c, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={c}
                onChange={e => updateConnection(i, e.target.value)}
                placeholder='e.g. "Daughter Anna married King Henry I of France"'
              />
              <button
                type="button"
                onClick={() => removeConnection(i)}
                className="shrink-0 text-xs px-2 py-1 text-red-500 hover:underline"
                disabled={connections.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addConnection}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
          >
            + Add connection
          </button>
        </div>
      </FormSection>

      <FormSection title="Sources">
        <p className="text-xs text-gray-500">Reference links shown when the card is expanded.</p>
        <div className="space-y-2">
          {sources.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr,1.5fr,auto] gap-2">
              <Input
                value={s.title}
                onChange={e => updateSource(i, "title", e.target.value)}
                placeholder="Source title"
              />
              <Input
                type="url"
                value={s.url}
                onChange={e => updateSource(i, "url", e.target.value)}
                placeholder="https://…"
              />
              <button
                type="button"
                onClick={() => removeSource(i)}
                className="shrink-0 text-xs px-2 py-1 text-red-500 hover:underline"
                disabled={sources.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSource}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
          >
            + Add source
          </button>
        </div>
      </FormSection>

      <FormSection title="Photo">
        <Field label="Profile photo" hint="Square images crop best (avatar is circular)">
          <ImageUpload value={profileImage} onChange={setProfileImage} folder="people" adminFetch={adminFetch} />
        </Field>
      </FormSection>

      <FormSection title="Visibility">
        <Field label="Display order" hint="Lower numbers appear first; leave blank to use creation date">
          <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} placeholder="10" />
        </Field>
        <CheckboxField label="Featured" checked={featured} onChange={e => setFeatured(e.target.checked)} />
        <CheckboxField label="Published (visible on site)" checked={published} onChange={e => setPublished(e.target.checked)} />
      </FormSection>

      <div className="flex gap-3 pt-2">
        <SaveButton loading={saving} />
        <button type="button" onClick={() => router.push("/admin/people")} className="px-4 py-2 text-sm text-gray-600 hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}

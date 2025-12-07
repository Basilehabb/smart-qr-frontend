// app/user/edit/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api"; // <-- عندك هذا الملف حسب كلامك
import { ExternalLink } from "lucide-react"; // optional icon (install if missing) or remove

type Platform = {
  id: string; // unique id e.g. "whatsapp"
  title: string; // display name
  category?: string; // social/contact/payment/other
  requires?: "phone" | "url" | "text" | null;
  template?: string | null; // e.g. "https://wa.me/{PHONE}"
  icon?: string | null;
};

type ProfileSections = {
  social: Record<string, string>;
  contact: Record<string, string>;
  payment: Record<string, string>;
  video: Record<string, string>;
  music: Record<string, string>;
  design: Record<string, string>;
  gaming: Record<string, string>;
  other: Record<string, string>;
};

const EMPTY_PROFILE: ProfileSections = {
  social: {},
  contact: {},
  payment: {},
  video: {},
  music: {},
  design: {},
  gaming: {},
  other: {},
};


export default function EditProfilePage() {
  // basic user info
  const [user, setUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const [password, setPassword] = useState("");

  // profile sections
  const [profile, setProfile] = useState<ProfileSections>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<keyof ProfileSections>("social");

  // available platforms (fetched from backend)
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // drag
  const dragItem = useRef<{ section: keyof ProfileSections; key: string } | null>(null);

  // sections list (for tabs + preview)
  const sections = [
    { key: "social" as keyof ProfileSections, title: "Social" },
    { key: "contact" as keyof ProfileSections, title: "Contact" },
    { key: "payment" as keyof ProfileSections, title: "Payment" },
    { key: "video" as keyof ProfileSections, title: "Video" },
    { key: "music" as keyof ProfileSections, title: "Music" },
    { key: "design" as keyof ProfileSections, title: "Design" },
    { key: "gaming" as keyof ProfileSections, title: "Gaming" },
    { key: "other" as keyof ProfileSections, title: "Other" },
  ];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // fetch dynamic platforms
        const pf = await api.get("/fields");
        // backend should return { platforms: [...] }
        setPlatforms(pf.data.platforms || []);

        // fetch current user
        const token = localStorage.getItem("user-token");
        if (!token) {
          // redirect to login (simple fallback)
          window.location.href = "/login";
          return;
        }
        const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        const u = res.data.user;
        setUser(u);
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setJob(u.job || "");
        setProfile({
          social: u.profile?.social || {},
          contact: u.profile?.contact || {},
          payment: u.profile?.payment || {},
          video: u.profile?.video || {},
          music: u.profile?.music || {},
          design: u.profile?.design || {},
          gaming: u.profile?.gaming || {},
          other: u.profile?.other || {},
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // =========================
  // Validation / helpers
  // =========================
  function isEmail(v: string) {
    return /\S+@\S+\.\S+/.test(v);
  }
  function isUrl(v: string) {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }
  function isPhone(v: string) {
    // simple phone validation: digits only (allow +)
    return /^[+\d][\d\s\-()]{5,}$/.test(v);
  }

  function generateLink(platform: Platform, value: string) {
    if (!platform || !value) return value;
    if (platform.template) {
      return platform.template.replace("{PHONE}", value.replace(/\D/g, "")).replace("{VALUE}", encodeURIComponent(value));
    }

    // default generators:
    if (platform.id === "whatsapp") {
      const digits = value.replace(/\D/g, "");
      return `https://wa.me/${digits}`;
    }
    if (platform.id === "instagram") {
      const handle = value.replace(/^@/, "");
      return `https://instagram.com/${handle}`;
    }
    if (platform.id === "website") {
      if (/^https?:\/\//.test(value)) return value;
      return `https://${value}`;
    }

    return value;
  }

  // Add field to profile under its category
  function addPlatformToProfile(platformId: string, rawValue: string) {
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform) return;

    const category = (platform.category || "other") as keyof ProfileSections;

    const value = (platform.template || platform.requires) ? generateLink(platform, rawValue) : rawValue;

    setProfile((prev) => ({
      ...prev,
      [category]: { ...(prev as any)[category], [platformId]: value },
    }));
  }

  // Delete field
  function deleteField(section: keyof ProfileSections, key: string) {
    setProfile((prev) => {
      const copy = { ...prev, [section]: { ...(prev as any)[section] } };
      delete (copy as any)[section][key];
      return copy;
    });
  }

  // Drag handlers
  function handleDragStart(e: React.DragEvent, section: keyof ProfileSections, key: string) {
    dragItem.current = { section, key };
    e.dataTransfer.effectAllowed = "move";
  }
  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }
  function handleDrop(e: React.DragEvent, section: keyof ProfileSections, key?: string) {
    e.preventDefault();
    if (!dragItem.current) return;
    const src = dragItem.current;
    const dst = { section, key };
    if (src.section !== dst.section) {
      // move item from src.section to dst.section (append)
      setProfile((prev) => {
        const srcCopy = { ...(prev as any)[src.section] };
        const val = srcCopy[src.key];
        delete srcCopy[src.key];

        const dstCopy = { ...(prev as any)[dst.section] };
        dstCopy[src.key] = val;

        return { ...prev, [src.section]: srcCopy, [dst.section]: dstCopy };
      });
    } else {
      // reorder within same section: place before 'key' if key provided
      setProfile((prev) => {
        const items = Object.entries((prev as any)[section]) as [string, string][];
        const from = items.findIndex(([k]) => k === src.key);
        if (from === -1) return prev;
        const [moved] = items.splice(from, 1);
        if (!key) items.push(moved);
        else {
          const to = items.findIndex(([k]) => k === key);
          items.splice(to, 0, moved);
        }
        const newObj: Record<string, string> = {};
        items.forEach(([k, v]) => (newObj[k] = v));
        return { ...prev, [section]: newObj };
      });
    }
    dragItem.current = null;
  }

  // Save to backend
  async function saveProfile() {
    setError(null);
    setSaving(true);

    // simple validation before sending
    // validate email
    if (!isEmail(email)) {
      setError("Invalid email");
      setSaving(false);
      return;
    }

    // validate all fields depending on platform requires
    for (const sec of Object.keys(profile) as (keyof ProfileSections)[]) {
      for (const [key, val] of Object.entries((profile as any)[sec]) as [string, string][]) {
        const plat = platforms.find((p) => p.id === key);
        if (!plat) continue;
        if (plat.requires === "phone" && !isPhone(val)) {
          setError(`${plat.title} requires a valid phone number`);
          setSaving(false);
          return;
        }
        if (plat.requires === "url" && !isUrl(val)) {
          setError(`${plat.title} requires a valid URL`);
          setSaving(false);
          return;
        }
        if (plat.requires === "text" && val.trim() === "") {
          setError(`${plat.title} value is required`);
          setSaving(false);
          return;
        }
      }
    }

    try {
      const token = localStorage.getItem("user-token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const payload: any = { name, email, phone, job, profile };
      if (password) payload.password = password;

      await api.put("/auth/update", payload, { headers: { Authorization: `Bearer ${token}` } });

      alert("Profile updated");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left: preview card */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="rounded-lg overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 h-40 relative p-4 text-white">
              <div className="text-3xl font-bold">{name ? name[0]?.toUpperCase() : "U"}</div>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-semibold">{name || "No name"}</h3>
              <p className="text-sm text-gray-500">{email}</p>
            </div>

            <div className="mt-6 space-y-3">
              {/* show icons + values for profile */}
              {sections.map((s) => {
                const entries = Object.entries((profile as any)[s.key]);
                return entries.length ? (
                  <div key={s.key}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">{s.title}</h4>
                    <div className="mt-2 space-y-1">
                    {(Object.entries((profile as any)[s.key]) as [string, string][])
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            •
                          </div>
                          <div className="text-sm text-gray-700 break-all">{String(v)}</div>
                        </div>
                    ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Center: Fields list (editor) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            {/* Basic info */}
            <div className="flex gap-3">
              <input className="flex-1 border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              <input className="w-80 border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <input className="w-64 border rounded px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            </div>
            <div className="flex gap-3">
              <input className="flex-1 border rounded px-3 py-2" value={job} onChange={(e) => setJob(e.target.value)} placeholder="Job / Title" />
              <input className="w-80 border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (optional)" type="password" />
              <button onClick={() => setShowAddDialog(true)} className="px-4 py-2 bg-indigo-600 text-white rounded">+ Add Link</button>
            </div>

            {/* tabs */}
            <div className="flex gap-2 border-b pb-2">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveTab(s.key)}
                  className={`px-3 py-2 rounded-t ${activeTab === s.key ? "bg-white border-l border-r border-t -mb-px text-indigo-600" : "text-gray-600"}`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Field editor */}
            <div className="bg-slate-50 p-4 rounded">
              <div className="space-y-3">
                {Object.entries(profile[activeTab]).length === 0 && <div className="text-gray-500">No links in this section yet. Add one with "Add Link".</div>}

                {Object.entries(profile[activeTab]).map(([plat, val]) => {
                  const platInfo = platforms.find((p) => p.id === plat);
                  const title = platInfo?.title || plat;
                  return (
                    <div
                      key={plat}
                      draggable
                      onDragStart={(e) => handleDragStart(e, activeTab, plat)}
                      onDragOver={allowDrop}
                      onDrop={(e) => handleDrop(e, activeTab, plat)}
                      className="p-3 bg-white rounded border flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="cursor-move text-slate-400 mt-1">≡</div>
                        <div>
                          <div className="text-sm font-semibold">{title}</div>
                          <input
                            className="border rounded px-3 py-2 w-[420px]"
                            value={val}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, [activeTab]: { ...(prev as any)[activeTab], [plat]: e.target.value } }))
                            }
                          />
                          <div className="text-xs text-gray-400 mt-1">{platInfo?.category || "other"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          title="Open"
                          onClick={() => {
                            window.open(val, "_blank");
                          }}
                          className="p-2 border rounded"
                        >
                          <ExternalLink size={14} />
                        </button>

                        <button
                          title="Delete"
                          onClick={() => deleteField(activeTab, plat)}
                          className="p-2 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && <div className="text-red-600">{error}</div>}

            <div className="flex justify-end gap-2">
              <button onClick={() => window.location.href = "/"} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={saveProfile} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">
                {saving ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Fields library */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-2">Fields</h3>
            <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Search platform" onChange={(e) => { /* optional search */ }} />

            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {/* group by category */}
              {["Most popular", "Social", "Communication", "Payment", "Other"].map((group) => {
                const list = platforms.filter((p) => (p.category || "other").toLowerCase().includes(group.toLowerCase()) || group === "Most popular");
                return (
                  <div key={group}>
                    <div className="text-xs text-gray-500 uppercase mb-2">{group}</div>
                    <div className="flex flex-wrap gap-2">
                      {list.slice(0, 20).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            // open add dialog preselected
                            setSelectedPlatform(p.id);
                            setSelectedValue("");
                            setShowAddDialog(true);
                          }}
                          className="px-3 py-1 border rounded text-sm bg-purple-50"
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add dialog (simple modal using fixed) */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[640px] p-6">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>

            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Platform</label>
              <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Choose platform</option>
                {platforms.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Value (URL / username / phone)</label>
              <input className="w-full border rounded px-3 py-2" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddDialog(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button
                onClick={() => {
                  if (!selectedPlatform) return alert("Choose platform");
                  const plat = platforms.find((p) => p.id === selectedPlatform);
                  if (!plat) return alert("Invalid platform");

                  // client-side validation before add
                  if (plat.requires === "phone" && !isPhone(selectedValue)) {
                    return alert("Please provide a valid phone number");
                  }
                  if (plat.requires === "url" && !isUrl(selectedValue)) {
                    return alert("Please provide a valid URL (https://...)");
                  }
                  if (plat.requires === "text" && !selectedValue.trim()) {
                    return alert("Value required");
                  }

                  addPlatformToProfile(selectedPlatform, selectedValue);
                  setShowAddDialog(false);
                  setSelectedPlatform("");
                  setSelectedValue("");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

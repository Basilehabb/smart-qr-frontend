// app/user/edit/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api"; // إذا مش موجود على السيرفر سيستخدم fallback
import { ExternalLink } from "lucide-react";

/**
 * Clean, ready-to-use edit profile page
 * - Fallback platforms if /fields fails
 * - Country code select + phone preview
 * - Upload profile image (client preview)
 * - Links preview show platform title (not raw url)
 * - Responsive layout
 */

/* ---------------------------
   Types
   --------------------------- */
type Platform = {
  id: string;
  title: string;
  category?: string;
  requires?: "phone" | "url" | "text" | null;
  template?: string | null; // e.g. https://wa.me/{PHONE} or https://x.com/{VALUE}
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

/* ---------------------------
   Fallback platforms (if API not available)
   --------------------------- */
const FALLBACK_PLATFORMS: Platform[] = [
  { id: "whatsapp", title: "WhatsApp", category: "Communication", requires: "phone", template: "https://wa.me/{PHONE}" },
  { id: "instagram", title: "Instagram", category: "Social", requires: "text", template: "https://instagram.com/{VALUE}" },
  { id: "facebook", title: "Facebook", category: "Social", requires: "url", template: "https://facebook.com/{VALUE}" },
  { id: "tiktok", title: "TikTok", category: "Social", requires: "text", template: "https://tiktok.com/@{VALUE}" },
  { id: "website", title: "Website", category: "Other", requires: "url" },
  { id: "phone", title: "Phone", category: "Contact", requires: "phone" },
  { id: "email", title: "Email", category: "Contact", requires: "text" },
];

/* ---------------------------
   Component
   --------------------------- */
export default function EditProfilePage() {
  // basic user info
  const [user, setUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+20"); // default Egypt
  const [job, setJob] = useState("");
  const [password, setPassword] = useState("");

  // avatar (data URL preview)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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

  // drag ref
  const dragItem = useRef<{ section: keyof ProfileSections; key: string } | null>(null);

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
        // try to fetch platforms from backend, fall back if not available
        try {
          const pf = await api.get("/fields");
          setPlatforms(pf?.data?.platforms || FALLBACK_PLATFORMS);
        } catch (innerErr) {
          console.warn("Failed to load /fields, using fallback platforms", innerErr);
          setPlatforms(FALLBACK_PLATFORMS);
        }

        // fetch current user (if you have /auth/me)
        try {
          const token = localStorage.getItem("user-token");
          if (!token) {
            // no token -> keep defaults (you can redirect)
            setLoading(false);
            return;
          }
          const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
          const u = res.data.user;
          if (u) {
            setUser(u);
            setName(u.name || "");
            setEmail(u.email || "");
            setPhone(u.phone || "");
            setJob(u.job || "");
            setAvatarUrl(u.avatar || null);
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
            if (u.countryCode) setCountryCode(u.countryCode);
          }
        } catch (meErr) {
          // it's acceptable to continue without user
          console.warn("Failed to fetch /auth/me", meErr);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------------------
     Helpers / Validation
     --------------------------- */
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
    // allow + and digits, minimal len
    return /^[+\d][\d\s\-()]{5,}$/.test(v);
  }

  function generateLink(platform: Platform, value: string) {
    if (!platform || !value) return value;
    if (platform.template) {
      return platform.template
        .replace("{PHONE}", value.replace(/\D/g, ""))
        .replace("{VALUE}", encodeURIComponent(value));
    }

    // defaults:
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

  /* ---------------------------
     Add / Delete / Drag handlers
     --------------------------- */
  function addPlatformToProfile(platformId: string, rawValue: string) {
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform) return;

    const category = (platform.category || "other") as keyof ProfileSections;
    const value = platform.template || platform.requires ? generateLink(platform, rawValue) : rawValue;

    setProfile((prev) => ({
      ...prev,
      [category]: { ...(prev as any)[category], [platformId]: value },
    }));
  }

  function deleteField(section: keyof ProfileSections, key: string) {
    setProfile((prev) => {
      const copy = { ...prev, [section]: { ...(prev as any)[section] } };
      delete (copy as any)[section][key];
      return copy;
    });
  }

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
      // move
      setProfile((prev) => {
        const srcCopy = { ...(prev as any)[src.section] };
        const val = srcCopy[src.key];
        delete srcCopy[src.key];
        const dstCopy = { ...(prev as any)[dst.section] };
        dstCopy[src.key] = val;
        return { ...prev, [src.section]: srcCopy, [dst.section]: dstCopy };
      });
    } else {
      // reorder
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

  /* ---------------------------
     Save profile
     --------------------------- */
  async function saveProfile() {
    setError(null);
    setSaving(true);

    // basic validations
    if (!isEmail(email)) {
      setError("Invalid email");
      setSaving(false);
      return;
    }

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

      const payload: any = { name, email, phone, countryCode, job, profile, avatar: avatarUrl };
      if (password) payload.password = password;

      // send to backend (api exists in your project)
      await api.put("/auth/update", payload, { headers: { Authorization: `Bearer ${token}` } });

      alert("Profile updated");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------
     Avatar upload (client preview)
     --------------------------- */
  function onAvatarSelected(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = String(e.target?.result || "");
      setAvatarUrl(url);
    };
    reader.readAsDataURL(file);
  }

  if (loading) return <div className="p-6">Loading…</div>;

  /* ---------------------------
     Render
     --------------------------- */
  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: preview card */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 h-40 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="absolute inset-0 w-full h-full object-cover opacity-95" />
              ) : (
                <div className="text-5xl font-bold text-white">{name ? name[0]?.toUpperCase() : "U"}</div>
              )}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold">{name || "No name"}</h3>
              <p className="text-sm text-gray-500 break-all">{email}</p>
              <p className="text-sm text-gray-500 mt-1">{countryCode} {phone}</p>
            </div>

            <div className="mt-6 space-y-3">
              {/* show icons + values for profile - grouped by section */}
              {sections.map((s) => {
                const entries = Object.entries((profile as any)[s.key]) as [string, string][];
                if (!entries.length) return null;
                return (
                  <div key={s.key}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">{s.title}</h4>
                    <div className="mt-2 space-y-1">
                      {entries.map(([k, v]) => {
                        // display platform title if available
                        const platInfo = platforms.find((p) => p.id === k);
                        const displayTitle = platInfo?.title || k;
                        return (
                          <div key={k} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">•</div>
                            <a href={v} target="_blank" rel="noreferrer" className="text-sm text-gray-700 hover:underline break-all">
                              {displayTitle}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Fields list (editor) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-6">
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            {/* Basic info */}
            <div className="flex flex-col md:flex-row gap-3">
              <input className="flex-1 border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              <input className="w-full md:w-80 border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <div className="flex items-center gap-2">
                <select className="border rounded px-2 py-2" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                  <option value="+20">🇪🇬 +20</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <input className="w-48 border rounded px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
              </div>
            </div>

            <div className="flex gap-3">
              <input className="flex-1 border rounded px-3 py-2" value={job} onChange={(e) => setJob(e.target.value)} placeholder="Job / Title" />
              <input className="w-80 border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (optional)" type="password" />
              <div>
                <label className="cursor-pointer inline-block px-4 py-2 bg-indigo-600 text-white rounded">
                  Upload avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onAvatarSelected(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* tabs */}
            <div className="flex gap-2 border-b pb-2 overflow-auto">
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
                {(Object.entries(profile[activeTab]) as [string, string][]).length === 0 && <div className="text-gray-500">No links in this section yet. Add one with "Add Link".</div>}

                {(Object.entries(profile[activeTab]) as [string, string][]).map(([plat, val]) => {
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
                      <div className="flex items-start gap-3 w-full">
                        <div className="cursor-move text-slate-400 mt-1">≡</div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{title}</div>
                          <input
                            className="border rounded px-3 py-2 w-full"
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
                          onClick={() => window.open(val, "_blank")}
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

            <div className="flex justify-between items-center">
              <div>
                <button onClick={() => setShowAddDialog(true)} className="px-4 py-2 bg-violet-600 text-white rounded">+ Add Link</button>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => (window.location.href = "/")} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={saveProfile} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">
                  {saving ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fields library (no search) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-2">Fields</h3>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {["Most popular", "Social", "Communication", "Payment", "Other"].map((group) => {
                // simple grouping: we show first items for "Most popular"
                const list = group === "Most popular" ? platforms.slice(0, 8) : platforms.filter((p) => (p.category || "other").toLowerCase().includes(group.toLowerCase()));
                return (
                  <div key={group}>
                    <div className="text-xs text-gray-500 uppercase mb-2">{group}</div>
                    <div className="flex flex-wrap gap-2">
                      {list.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
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

      {/* Add dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
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

                  // client-side validation
                  if (plat.requires === "phone" && !isPhone(selectedValue)) return alert("Please provide a valid phone");
                  if (plat.requires === "url" && !isUrl(selectedValue)) return alert("Please provide a valid URL (https://...)");
                  if (plat.requires === "text" && !selectedValue.trim()) return alert("Value required");

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

"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api"; // your axios/fetch wrapper
import { ExternalLink } from "lucide-react";

type Platform = {
  id: string;
  title: string;
  category?: string;
  requires?: "phone" | "url" | "text" | null;
  template?: string | null;
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
  const [countryCode, setCountryCode] = useState("+20");
  const [job, setJob] = useState("");
  const [password, setPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // profile sections
  const [profile, setProfile] = useState<ProfileSections>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<keyof ProfileSections>("social");

  // available platforms
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // drag
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
        // fetch platforms (if missing, fallback to built-in list)
        try {
          const pf = await api.get("/fields");
          setPlatforms(pf.data.platforms || fallbackPlatforms());
        } catch (err) {
          // If backend 404 or not ready, use fallback
          setPlatforms(fallbackPlatforms());
        }

        // fetch current user
        const token = localStorage.getItem("user-token");
        if (!token) {
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
        if (u.profile) {
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
        }
        if (u.avatarUrl) setAvatarPreview(u.avatarUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // fallback platforms if backend isn't ready
  function fallbackPlatforms(): Platform[] {
    return [
      { id: "website", title: "Website", category: "other", requires: "url" },
      { id: "whatsapp", title: "WhatsApp", category: "contact", requires: "phone", template: "https://wa.me/{PHONE}" },
      { id: "instagram", title: "Instagram", category: "social", requires: "text", template: "https://instagram.com/{VALUE}" },
      { id: "facebook", title: "Facebook", category: "social", requires: "url" },
      { id: "tiktok", title: "TikTok", category: "social", requires: "text", template: "https://tiktok.com/@{VALUE}" },
      { id: "phone", title: "Phone", category: "contact", requires: "phone" },
      // add more as needed
    ];
  }

  // Validation helpers
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
    // accept digits, spaces, dashes, parentheses and leading +
    return /^[+\d][\d\s\-()]{4,}$/.test(v);
  }

  function digitsOnly(v: string) {
    return v.replace(/\D/g, "");
  }

  function generateLink(platform: Platform, value: string) {
    if (!platform || !value) return value;
    if (platform.template) {
      return platform.template.replace("{PHONE}", digitsOnly(value)).replace("{VALUE}", encodeURIComponent(value));
    }

    // defaults
    if (platform.id === "whatsapp") {
      // ensure we have country code + digits to form wa.me link
      let digits = digitsOnly(value);
      // if value is phone without code, try attach countryCode if not present
      if (!digits.startsWith("00") && !digits.startsWith("+") && !digits.startsWith(countryCode.replace("+", "")) && !digits.startsWith(countryCode)) {
        digits = (countryCode.replace("+", "") || "") + digits;
      }
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

  // Add field
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

  // Delete
  function deleteField(section: keyof ProfileSections, key: string) {
    setProfile((prev) => {
      const copy = { ...prev, [section]: { ...(prev as any)[section] } };
      delete (copy as any)[section][key];
      return copy;
    });
  }

  // Drag
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
    if (src.section !== section) {
      setProfile((prev) => {
        const srcCopy = { ...(prev as any)[src.section] };
        const val = srcCopy[src.key];
        delete srcCopy[src.key];
        const dstCopy = { ...(prev as any)[section] };
        dstCopy[src.key] = val;
        return { ...prev, [src.section]: srcCopy, [section]: dstCopy };
      });
    } else {
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

  // Avatar upload local preview + optional backend upload
  function onAvatarChange(file?: File) {
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function uploadAvatarToServer() {
    if (!avatarFile) return null;
    try {
      const fd = new FormData();
      fd.append("file", avatarFile);
      // if you have an endpoint to upload avatar, use it (example '/upload/avatar')
      // const res = await api.post("/upload/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
      // return res.data.url;
      // fallback: return base64 preview (already set)
      return avatarPreview;
    } catch (err) {
      console.error("upload avatar failed", err);
      return null;
    }
  }

  // Save
  async function saveProfile() {
    setError(null);
    setSaving(true);

    if (!isEmail(email)) {
      setError("Invalid email");
      setSaving(false);
      return;
    }
    // validate fields by platform
    for (const sec of Object.keys(profile) as (keyof ProfileSections)[]) {
      for (const [key, val] of Object.entries((profile as any)[sec]) as [string, string][]) {
        const plat = platforms.find((p) => p.id === key);
        if (!plat) continue;
        if (plat.requires === "phone" && !isPhone(val) && !isPhone(digitsOnly(val))) {
          setError(`${plat.title} requires a valid phone number`);
          setSaving(false);
          return;
        }
        if (plat.requires === "url" && !isUrl(val)) {
          setError(`${plat.title} requires a valid URL`);
          setSaving(false);
          return;
        }
        if (plat.requires === "text" && (!val || val.trim() === "")) {
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

      const avatarUrl = await uploadAvatarToServer();

      const payload: any = { name, email, phone, countryCode, job, profile };
      if (password) payload.password = password;
      if (avatarUrl) payload.avatar = avatarUrl;

      await api.put("/auth/update", payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("Profile updated");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // small helper: platform title lookup when rendering preview list
  function getPlatformTitle(id: string) {
    return platforms.find((p) => p.id === id)?.title || id;
  }

  // search helper
  const filteredPlatforms = platforms.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: preview card */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="rounded-lg overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 h-40 relative p-4 text-white flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white" />
              ) : (
                <div className="text-5xl font-bold">{name ? name[0].toUpperCase() : "U"}</div>
              )}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold">{name || "No name"}</h3>
              <p className="text-sm text-gray-500">{email}</p>
              <p className="text-sm text-gray-500">{countryCode} {phone}</p>
            </div>

            <div className="mt-6 space-y-3">
              {sections.map((s) => {
                const entries = Object.entries((profile as any)[s.key]) as [string, string][];
                return entries.length ? (
                  <div key={s.key}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">{s.title}</h4>
                    <div className="mt-2 space-y-1">
                      {entries.map(([k, v]) => (
                        <div key={k} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">•</div>
                          <div className="text-sm text-gray-700">
                            <div className="font-medium">{getPlatformTitle(k)}</div>
                            <a href={v} target="_blank" rel="noreferrer" className="text-xs text-gray-500 break-all inline-block">
                              {v}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
        {/* Center Column – Editor */}
          <div className="col-span-12 md:col-span-8 lg:col-span-6">
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              {/* Basic Info Section */}
              <div className="space-y-4">

              {/* Row 1 — Name + Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  {/* Name */}
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />

                  {/* Email */}
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />

                  {/* Phone (with country code inside) */}
                  <div className="relative w-full">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="
                        absolute left-2 top-1/2 -translate-y-1/2 
                        bg-transparent 
                        text-xs   /* أصغر */
                        text-gray-600
                        cursor-pointer 
                        pr-5 
                        outline-none
                        w-14      /* العرض أصغر */
                      "
                    >
                      <option value="+20">🇪🇬 +20</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>

                    <input
                      className="border rounded px-3 py-2 w-full pl-20 text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                {/* Row 2 — Job + Password + Avatar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder="Job / Title"
                  />

                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="New password (optional)"
                  />

                  <label className="px-4 py-2 bg-indigo-600 text-white rounded text-center cursor-pointer w-full">
                    Upload avatar
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onAvatarChange(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b pb-2 overflow-x-auto">
                {sections.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveTab(s.key)}
                    className={`px-3 py-2 rounded-t ${
                      activeTab === s.key
                        ? "bg-white border-l border-r border-t -mb-px text-indigo-600"
                        : "text-gray-600"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* Field Editor */}
              <div className="bg-slate-50 p-4 rounded">
                <div className="space-y-3">
                  {Object.entries(profile[activeTab]).length === 0 && (
                    <div className="text-gray-500">No links in this section yet. Add one with "Add Link".</div>
                  )}

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
                        <div className="flex items-start gap-3">
                          <div className="cursor-move text-slate-400 mt-1">≡</div>
                          <div>
                            <div className="text-sm font-semibold">{title}</div>
                            <input
                              className="border rounded px-3 py-2 w-[420px] max-w-full"
                              value={val}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  [activeTab]: { ...(prev as any)[activeTab], [plat]: e.target.value },
                                }))
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

              {/* Buttons */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4">
                <button 
                  onClick={() => setShowAddDialog(true)} 
                  className="px-4 py-2 bg-purple-600 text-white rounded w-full md:w-auto"
                >
                  + Add Link
                </button>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => (window.location.href = "/")} 
                    className="px-4 py-2 border rounded w-full md:w-auto"
                  >
                    Cancel
                  </button>

                  <button 
                    onClick={saveProfile} 
                    disabled={saving} 
                    className="px-4 py-2 bg-green-600 text-white rounded w-full md:w-auto"
                  >
                    {saving ? "Saving..." : "Save & Continue"}
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Right: Fields library */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-2">Fields</h3>

            <div className="mb-3">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Search platform"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {["Most popular", "Social", "Communication", "Payment", "Other"].map((group) => {
                const list = filteredPlatforms.filter((p) => {
                  if (group === "Most popular") return true;
                  return (p.category || "other").toLowerCase().includes(group.toLowerCase());
                });
                if (!list.length) return null;
                return (
                  <div key={group}>
                    <div className="text-xs text-gray-500 uppercase mb-2">{group}</div>
                    <div className="flex flex-wrap gap-2">
                      {list.slice(0, 20).map((p) => (
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

      {/* Add dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[640px] p-6">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>

            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Platform</label>
              <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Choose platform</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Value (URL / username / phone)</label>
              <input className="w-full border rounded px-3 py-2" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddDialog(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedPlatform) return alert("Choose platform");
                  const plat = platforms.find((p) => p.id === selectedPlatform);
                  if (!plat) return alert("Invalid platform");
                  if (plat.requires === "phone" && !isPhone(selectedValue) && !isPhone(digitsOnly(selectedValue))) {
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
</div>
  );
}

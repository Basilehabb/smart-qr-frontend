"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

/**
 * Edit profile - Fields-only page
 * - Left: card preview (HiHello-like)
 * - Center: fields editor (drag/drop)
 * - Right: field library (platforms)
 *
 * Notes:
 * - token from localStorage "user-token"
 * - WhatsApp special handling => preview link uses https://wa.me/<value>
 */

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

const PLATFORM_MAP: Record<string, keyof ProfileSections> = {
  website: "other",
  link: "other",
  instagram: "social",
  facebook: "social",
  x: "social",
  twitter: "social",
  linkedin: "social",
  tiktok: "social",
  snapchat: "social",
  threads: "social",
  pinterest: "social",
  whatsapp: "contact",
  telegram: "contact",
  email: "contact",
  phone: "contact",
  discord: "contact",
  youtube: "video",
  vimeo: "video",
  twitch: "video",
  spotify: "music",
  behance: "design",
  dribbble: "design",
  psn: "gaming",
  xbox: "gaming",
  nintendo: "gaming",
  paypal: "payment",
  venmo: "payment",
  zelle: "payment",
};

const PLATFORMS = Object.keys(PLATFORM_MAP);

export default function EditProfilePage() {
  const router = useRouter();

  // basic user info
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [profile, setProfile] = useState<ProfileSections>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<keyof ProfileSections>("social");

  // add link dialog
  const [showAdd, setShowAdd] = useState(false);
  const [selPlatform, setSelPlatform] = useState("website");
  const [value, setValue] = useState("");

  // drag state
  const dragItem = useRef<{ section: keyof ProfileSections; key: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) {
      // preserve return and go to login
      localStorage.setItem("return-url", "/user/edit");
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        const u = res.data.user;
        setUserId(u.id || u._id || null);
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        // normalize incoming profile (maps -> objects)
        const incoming: ProfileSections = {
          social: u.profile?.social || {},
          contact: u.profile?.contact || {},
          payment: u.profile?.payment || {},
          video: u.profile?.video || {},
          music: u.profile?.music || {},
          design: u.profile?.design || {},
          gaming: u.profile?.gaming || {},
          other: u.profile?.other || {},
        };
        setProfile(incoming);
      } catch (err) {
        console.error(err);
        localStorage.setItem("return-url", "/user/edit");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // add new link (one input)
  const addLink = () => {
    if (!selPlatform || !value.trim()) return alert("Choose platform and enter value");
    const section = PLATFORM_MAP[selPlatform] || "other";
    setProfile((p) => ({
      ...p,
      [section]: { ...p[section], [selPlatform + "_" + Date.now()]: value.trim() },
    }));
    setShowAdd(false);
    setValue("");
  };

  // delete
  const deleteItem = (section: keyof ProfileSections, key: string) => {
    setProfile((prev) => {
      const copy = { ...prev, [section]: { ...prev[section] } };
      delete copy[section][key];
      return copy;
    });
  };

  // inline edit save
  const saveEdit = (section: keyof ProfileSections, key: string, newVal: string) => {
    setProfile((prev) => ({ ...prev, [section]: { ...prev[section], [key]: newVal } }));
  };

  // drag/drop handlers
  const handleDragStart = (e: React.DragEvent, section: keyof ProfileSections, key: string) => {
    dragItem.current = { section, key };
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnItem = (e: React.DragEvent, targetSection: keyof ProfileSections, targetKey: string) => {
    e.preventDefault();
    if (!dragItem.current) return;
    const src = dragItem.current;
    if (src.section !== targetSection) {
      // move to different section at the end
      setProfile((prev) => {
        const srcCopy = { ...prev[src.section] };
        const val = srcCopy[src.key];
        delete srcCopy[src.key];
        const dstCopy = { ...prev[targetSection], [src.key]: val };
        return { ...prev, [src.section]: srcCopy, [targetSection]: dstCopy };
      });
    } else {
      // reorder within same section
      setProfile((prev) => {
        const items = Object.entries(prev[targetSection]);
        const fromIdx = items.findIndex(([k]) => k === src.key);
        const toIdx = items.findIndex(([k]) => k === targetKey);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const [moved] = items.splice(fromIdx, 1);
        items.splice(toIdx, 0, moved);
        const newObj: Record<string, string> = {};
        items.forEach(([k, v]) => (newObj[k] = v));
        return { ...prev, [targetSection]: newObj };
      });
    }
    dragItem.current = null;
  };

  // drop on empty area of section -> move item to end
  const handleDropOnSection = (e: React.DragEvent, targetSection: keyof ProfileSections) => {
    e.preventDefault();
    if (!dragItem.current) return;
    const src = dragItem.current;
    if (src.section === targetSection) return; // nothing
    setProfile((prev) => {
      const srcCopy = { ...prev[src.section] };
      const val = srcCopy[src.key];
      delete srcCopy[src.key];
      const dstCopy = { ...prev[targetSection], [src.key]: val };
      return { ...prev, [src.section]: srcCopy, [targetSection]: dstCopy };
    });
    dragItem.current = null;
  };

  // save to server
  const saveProfileToServer = async () => {
    setError(null);
    setSaving(true);
    try {
      const token = localStorage.getItem("user-token");
      if (!token) {
        localStorage.setItem("return-url", "/user/edit");
        router.push("/login");
        return;
      }

      // payload: name, email, phone, password (if given), profile
      const payload: any = { name, email, phone, profile };
      if (password) payload.password = password;

      await api.put("/auth/update", payload, { headers: { Authorization: `Bearer ${token}` } });

      // after save, redirect to first qr if any (same flow you used)
      const qrRes = await api.get("/qr/my", { headers: { Authorization: `Bearer ${token}` } });
      const codes = qrRes.data?.codes;
      if (codes && codes.length > 0) router.push(`/qr/${codes[0]}`);
      else router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // helper for preview link (WhatsApp special case)
  const makeLinkForDisplay = (platKey: string, rawValue: string) => {
    // if platform is whatsapp (we stored key name containing 'whatsapp' maybe + timestamp)
    if (platKey.includes("whatsapp")) {
      // remove non-digits and plus
      const num = rawValue.replace(/[^\d+]/g, "");
      const cleaned = num.startsWith("+") ? num.replace("+", "") : num;
      return `https://wa.me/${cleaned}`;
    }
    // for other platform keys, if value looks like full url (starts with http) use as is, else prefix https://
    if (/^https?:\/\//i.test(rawValue)) return rawValue;
    return rawValue.startsWith("www.") ? `https://${rawValue}` : rawValue;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left: card preview */}
        <aside className="col-span-3">
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="rounded-lg overflow-hidden" style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)" }}>
              <div className="p-6 text-white">
                <div className="text-3xl font-bold">{name ? name.split(" ")[0] : "User"}</div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">👤</div>
                  <div>{email}</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm text-gray-500 mb-2">Public Links</h4>
              <div className="space-y-2">
                {Object.entries(profile).flatMap(([section, o]) =>
                  Object.entries(o).map(([k, v]) => (
                    <div key={k} className="bg-slate-50 p-2 rounded flex items-center justify-between">
                      <div className="text-sm truncate">{k.replace(/_.+$/, "")}</div>
                      <a
                        href={makeLinkForDisplay(k, v)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-sm"
                      >
                        Open
                      </a>
                    </div>
                  ))
                ).length === 0 ? <div className="text-sm text-gray-400">No links yet</div> : null}
              </div>
            </div>
          </div>
        </aside>

        {/* Center: editor */}
        <main className="col-span-6">
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="p-3 border rounded" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-3 border rounded" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="p-3 border rounded" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (optional)" className="p-3 border rounded col-span-1 md:col-span-2" type="password" />
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAdd(true)} className="px-3 py-2 border rounded">+ Add Link</button>
                <button onClick={saveProfileToServer} className={`px-4 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-green-600"}`} disabled={saving}>
                  {saving ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="mb-3 flex gap-2 flex-wrap">
                {(["social","contact","payment","video","music","design","gaming","other"] as (keyof ProfileSections)[]).map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-2 rounded ${activeTab===t ? "bg-white border" : "text-gray-600"}`}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>

              {/* editor section */}
              <div
                onDragOver={allowDrop}
                onDrop={(e) => handleDropOnSection(e, activeTab)}
                className="bg-white p-4 rounded border"
              >
                {Object.entries(profile[activeTab]).length === 0 ? (
                  <div className="text-gray-500">No links in this section. Add one with "Add Link".</div>
                ) : (
                  Object.entries(profile[activeTab]).map(([k, v]) => (
                    <FieldRow
                      key={k}
                      platKey={k}
                      value={v}
                      onDelete={() => deleteItem(activeTab, k)}
                      onChange={(nv) => saveEdit(activeTab, k, nv)}
                      onDragStart={(ev) => handleDragStart(ev, activeTab, k)}
                      onDropOnItem={(ev) => handleDropOnItem(ev, activeTab, k)}
                    />
                  ))
                )}
              </div>
            </div>
            {error && <div className="text-red-600 mt-3">{error}</div>}
          </div>
        </main>

        {/* Right: platforms list */}
        <aside className="col-span-3">
          <div className="bg-white rounded-xl shadow p-4 sticky top-6">
            <h4 className="font-semibold mb-3">Fields</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {PLATFORMS.slice(0, 12).map((p) => (
                <button
                  key={p}
                  onClick={() => { setSelPlatform(p); setShowAdd(true); }}
                  className="px-2 py-1 border rounded text-sm text-gray-700"
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500">More platforms available in the modal.</div>
          </div>

          {/* right preview boxes */}
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <h4 className="font-semibold mb-2">Public Profile Preview</h4>
            {(["social","contact","payment","video","music","design","gaming","other"] as (keyof ProfileSections)[]).map((s) => (
              <div key={s} className="border rounded p-3 mb-3">
                <div className="font-medium mb-2">{s.charAt(0).toUpperCase()+s.slice(1)}</div>
                {Object.entries(profile[s]).length === 0 ? <div className="text-gray-400">—</div> :
                  Object.entries(profile[s]).map(([k,v]) => (
                    <div key={k} className="flex justify-between items-center text-sm">
                      <div>{k.replace(/_.+$/, "").toUpperCase()}</div>
                      <a className="text-blue-600" href={makeLinkForDisplay(k, v)} target="_blank" rel="noreferrer">open</a>
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Add Link Modal (simple) */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-3">Add new link</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <select value={selPlatform} onChange={(e) => setSelPlatform(e.target.value)} className="p-2 border rounded">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="URL / username / phone" className="p-2 border rounded col-span-2" />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={addLink} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* FieldRow component (inline for single-file) */
function FieldRow(props: {
  platKey: string;
  value: string;
  onDelete: () => void;
  onChange: (v: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDropOnItem: (e: React.DragEvent) => void;
}) {
  const { platKey, value, onDelete, onChange, onDragStart, onDropOnItem } = props;
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => setVal(value), [value]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropOnItem}
      className="flex items-center justify-between p-2 bg-slate-50 rounded mb-2"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-6 text-gray-500">≡</div>
        <div className="flex-1">
          <div className="text-sm font-medium">{platKey.replace(/_.+$/, "").toUpperCase()}</div>
          {editing ? (
            <input value={val} onChange={(e) => setVal(e.target.value)} className="p-2 border rounded w-full" />
          ) : (
            <div className="text-xs text-gray-600 truncate">{value}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <button onClick={() => { onChange(val); setEditing(false); }} className="px-2 py-1 border rounded">Save</button>
            <button onClick={() => { setVal(value); setEditing(false); }} className="px-2 py-1 border rounded">Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="px-2 py-1 border rounded">Edit</button>
            <button onClick={onDelete} className="px-2 py-1 bg-red-600 text-white rounded">Del</button>
            <a href={platKey.includes("whatsapp") ? `https://wa.me/${value.replace(/[^\d+]/g,"").replace("+","")}` : (value.startsWith("http") ? value : (value.startsWith("www.") ? `https://${value}` : value))}
               target="_blank" rel="noreferrer"
               className="px-2 py-1 border rounded"
            >
              Open
            </a>
          </>
        )}
      </div>
    </div>
  );
}

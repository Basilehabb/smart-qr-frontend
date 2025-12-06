"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

/**
 * Edit Profile Page (HiHello-like)
 *
 * Single-file frontend implementation:
 * - Sidebar (left)
 * - Large preview card (center-left)
 * - Editor with tabs (center)
 * - Live preview (right)
 * - Add-link modal
 * - Drag & drop basic reorder / move between sections
 *
 * Notes:
 * - Keeps typings simple to avoid TS errors when pasted into projects.
 * - Uses Tailwind for styling (project already uses Tailwind in original repo).
 */

/* Types */
type SectionsKeys =
  | "social"
  | "contact"
  | "payment"
  | "video"
  | "music"
  | "design"
  | "gaming"
  | "other";

type ProfileShape = Record<SectionsKeys, Record<string, string>>;

const EMPTY_PROFILE: ProfileShape = {
  social: {},
  contact: {},
  payment: {},
  video: {},
  music: {},
  design: {},
  gaming: {},
  other: {},
};

const SECTIONS: { key: SectionsKeys; title: string }[] = [
  { key: "social", title: "Social" },
  { key: "contact", title: "Contact" },
  { key: "payment", title: "Payment" },
  { key: "video", title: "Video" },
  { key: "music", title: "Music" },
  { key: "design", title: "Design" },
  { key: "gaming", title: "Gaming" },
  { key: "other", title: "Other" },
];

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const [password, setPassword] = useState("");

  const [profile, setProfile] = useState<ProfileShape>(EMPTY_PROFILE);

  const [activeTab, setActiveTab] = useState<SectionsKeys>("social");

  // Add-link modal
  const [showAdd, setShowAdd] = useState(false);
  const [newPlatform, setNewPlatform] = useState("");
  const [newValue, setNewValue] = useState("");

  // Inline edit
  const [editing, setEditing] = useState<{ section: SectionsKeys; key: string } | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<{ section: SectionsKeys; key: string } | null>(
    null
  );

  // Drag/drop
  const dragItem = useRef<{ section: SectionsKeys; key: string } | null>(null);

  // Error / saving
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("user-token");
        if (!token) {
          // redirect to login but preserve return
          localStorage.setItem("return-url", "/user/edit");
          router.push("/login");
          return;
        }

        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data.user;
        setUser(u);
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setJob(u.job || "");
        // convert missing sections
        const incoming: ProfileShape = {
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
        console.error("fetch me error", err);
        localStorage.setItem("return-url", "/user/edit");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // Add a new link into the selected section (determine section from platform if possible)
  const addNewLink = () => {
    if (!newPlatform || !newValue) return alert("Enter platform and value");
    setProfile((prev) => {
      // put into activeTab
      const copy = { ...prev };
      copy[activeTab] = { ...copy[activeTab], [newPlatform]: newValue };
      return copy;
    });
    setNewPlatform("");
    setNewValue("");
    setShowAdd(false);
  };

  // Delete
  const doDelete = () => {
    if (!confirmDelete) return;
    const { section, key } = confirmDelete;
    setProfile((prev) => {
      const copy = { ...prev };
      const sec = { ...copy[section] };
      delete sec[key];
      copy[section] = sec;
      return copy;
    });
    setConfirmDelete(null);
  };

  // Inline save edit
  const confirmEdit = (section: SectionsKeys, key: string) => {
    setProfile((prev) => {
      const copy = { ...prev };
      copy[section] = { ...copy[section], [key]: editingValue };
      return copy;
    });
    setEditing(null);
    setEditingValue("");
  };

  // Drag start
  const handleDragStart = (e: React.DragEvent, section: SectionsKeys, key: string) => {
    dragItem.current = { section, key };
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOn = (e: React.DragEvent, section: SectionsKeys, key?: string) => {
    e.preventDefault();
    if (!dragItem.current) return;
    const source = dragItem.current;
    const destSection = section;
    setProfile((prev) => {
      const copy = { ...prev };
      const src = { ...copy[source.section] };
      const value = src[source.key];
      delete src[source.key];
      // if dest key provided and same section -> reorder, else append to dest
      if (source.section === destSection && key) {
        // reorder within same section
        const entries = Object.entries(src);
        // find index to insert before 'key'
        const idx = entries.findIndex(([k]) => k === key);
        const newEntries: [string, string][] = [];
        let inserted = false;
        entries.forEach((ent, i) => {
          if (i === idx && !inserted) {
            newEntries.push([source.key, value]);
            inserted = true;
          }
          newEntries.push(ent);
        });
        if (!inserted) newEntries.push([source.key, value]);
        const newSec: Record<string, string> = {};
        newEntries.forEach(([k, v]) => (newSec[k] = v));
        copy[destSection] = newSec;
      } else {
        // move into destSection appended
        const dest = { ...copy[destSection], [source.key]: value };
        copy[source.section] = src;
        copy[destSection] = dest;
      }
      return copy;
    });
    dragItem.current = null;
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  // Save profile to server
  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("user-token");
      if (!token) {
        localStorage.setItem("return-url", "/user/edit");
        router.push("/login");
        return;
      }

      const payload: any = { name, email, phone, job, profile };
      if (password) payload.password = password;

      await api.put("/auth/update", payload, { headers: { Authorization: `Bearer ${token}` } });

      // on success redirect to first QR or home
      const r = await api.get("/qr/my", { headers: { Authorization: `Bearer ${token}` } });
      const codes = r.data.codes;
      if (codes && codes.length > 0) {
        router.push(`/qr/${codes[0]}`);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("save error", err);
      setError(err?.response?.data?.message || "Failed to save");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6 py-8 px-4">
        {/* Sidebar */}
        <aside className="col-span-2 bg-white rounded-xl shadow p-4 sticky top-6 h-min">
          <div className="mb-6">
            <div className="text-lg font-bold">Smart QR</div>
            <div className="text-sm text-slate-500">Edit profile</div>
          </div>

          <nav className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-100">Dashboard</button>
            <button className="w-full text-left px-3 py-2 rounded bg-slate-50">Cards / Profile</button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-100">My QRs</button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-100">Analytics</button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-100">Settings</button>
          </nav>

          <div className="mt-6 border-t pt-4">
            <div className="text-xs text-slate-500">Signed in as</div>
            <div className="text-sm font-medium">{user.name || user.email}</div>
            <div className="text-xs text-slate-400">{user.email}</div>
          </div>
        </aside>

        {/* Center: Preview card + Editor */}
        <main className="col-span-7 space-y-6">
          {/* Top: Preview card */}
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-6">
            <div className="w-2/5">
              <div className="bg-gradient-to-br from-purple-600 to-purple-400 rounded-xl p-6 text-white">
                <div className="text-2xl font-bold">{name || "Your Name"}</div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM3 21a9 9 0 0118 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div>
                    <div className="text-sm">{email}</div>
                    <div className="text-xs opacity-80">{phone}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">Profile</div>
                  <div className="text-lg font-semibold">Live Preview</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAdd(true)}
                    className="px-3 py-2 bg-white border rounded hover:bg-slate-50"
                  >
                    + Add Link
                  </button>
                  <button
                    onClick={saveProfile}
                    className={`px-3 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-green-600"}`}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save & Continue"}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {SECTIONS.slice(0, 4).map((s) => (
                  <div key={s.key} className="p-3 border rounded">
                    <div className="text-xs text-slate-500">{s.title}</div>
                    <div className="mt-2">
                      {Object.entries(profile[s.key]).length === 0 ? (
                        <div className="text-sm text-gray-400">—</div>
                      ) : (
                        Object.entries(profile[s.key]).map(([k, v]) => (
                          <div key={k} className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium">{k.toUpperCase()}</div>
                              <div className="text-xs text-slate-500 break-all">{v}</div>
                            </div>
                            <a href={v} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">Open</a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <div className="text-sm text-slate-500">Manage your public links and contact details</div>
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input value={name} onChange={(e) => setName(e.target.value)} className="p-3 border rounded" placeholder="Full name" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 border rounded" placeholder="Email" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="p-3 border rounded" placeholder="Phone" />
              <input value={job} onChange={(e) => setJob(e.target.value)} className="p-3 border rounded" placeholder="Job / Title" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 border rounded" placeholder="New password (optional)" type="password" />
            </div>

            {/* Tabs */}
            <div className="mb-4 border-b">
              <div className="flex flex-wrap gap-2">
                {SECTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveTab(s.key)}
                    className={`px-3 py-2 rounded-t ${activeTab === s.key ? "bg-white border border-b-0 text-slate-700" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Active section editor */}
            <div className="p-4 border rounded bg-white">
              {Object.entries(profile[activeTab]).length === 0 ? (
                <div className="text-gray-500 mb-3">No links in this section. Add one with "Add Link".</div>
              ) : null}

              <div className="space-y-3">
                {Object.entries(profile[activeTab]).map(([plat, val]) => (
                  <div
                    key={plat}
                    draggable
                    onDragStart={(e) => handleDragStart(e, activeTab, plat)}
                    onDragOver={allowDrop}
                    onDrop={(e) => handleDropOn(e, activeTab, plat)}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-slate-700">{plat.toUpperCase()}</div>
                      {editing && editing.section === activeTab && editing.key === plat ? (
                        <div className="flex items-center gap-2">
                          <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="p-2 border rounded w-80" />
                          <button onClick={() => confirmEdit(activeTab, plat)} className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                          <button onClick={() => setEditing(null)} className="px-2 py-1 border rounded">Cancel</button>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 break-all">{val}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing({ section: activeTab, key: plat });
                          setEditingValue(val);
                        }}
                        className="px-2 py-1 border rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setConfirmDelete({ section: activeTab, key: plat })}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>

                      <a href={val} target="_blank" rel="noreferrer" className="px-2 py-1 border rounded">Open</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right: full preview (all sections) */}
        <aside className="col-span-3">
          <div className="bg-white rounded-xl shadow p-6 sticky top-6">
            <h3 className="font-semibold mb-3">Public Profile Preview</h3>

            <div className="space-y-4">
              {SECTIONS.map((s) => (
                <div key={s.key} className="border rounded p-3">
                  <div className="font-medium mb-2">{s.title}</div>
                  <div className="space-y-2">
                    {Object.entries(profile[s.key]).length === 0 ? (
                      <div className="text-sm text-gray-400">—</div>
                    ) : (
                      Object.entries(profile[s.key]).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium">{k.toUpperCase()}</div>
                            <div className="text-xs text-slate-500 break-all">{v}</div>
                          </div>
                          <a href={v} target="_blank" rel="noreferrer" className="text-blue-600">Open</a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Add Link Modal (simple) */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h4 className="text-lg font-semibold mb-4">Add new link</h4>

            <div className="grid gap-3">
              <input value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} placeholder="Platform (e.g., facebook, phone, website)" className="p-3 border rounded" />
              <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Value (URL / username / phone)" className="p-3 border rounded" />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={addNewLink} className="px-4 py-2 bg-blue-600 text-white rounded">Add Link</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-2">Delete link</h4>
            <p className="text-sm text-slate-600 mb-4">Are you sure you want to remove <b>{confirmDelete.key}</b> from <b>{confirmDelete.section}</b>?</p>

            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={doDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* error snackbar */}
      {error && (
        <div className="fixed right-6 bottom-6 bg-red-600 text-white px-4 py-2 rounded shadow">
          {error}
        </div>
      )}
    </div>
  );
}

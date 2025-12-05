"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// shadcn ui components (adjust import paths to your project structure if needed)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { IconButton } from "@/components/ui/icon-button";


// icons
import {
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  X,
  Check,
  Move,
} from "lucide-react";

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
  wechat: "contact",
  line: "contact",
  signal: "contact",
  paypal: "payment",
  cashapp: "payment",
  zelle: "payment",
  venmo: "payment",
  youtube: "video",
  vimeo: "video",
  twitch: "video",
  spotify: "music",
  applemusic: "music",
  soundcloud: "music",
  behance: "design",
  dribbble: "design",
  psn: "gaming",
  xbox: "gaming",
  nintendo: "gaming",
  website: "other",
  link: "other",
  pdf: "other",
  calendly: "other",
  patreon: "other",
  address: "other",
  note: "other",
};

const PLATFORMS = Object.keys(PLATFORM_MAP);

export default function EditProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const [password, setPassword] = useState("");

  const [profile, setProfile] = useState<ProfileSections>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<keyof ProfileSections>("social");

  // add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [platformValue, setPlatformValue] = useState("");

  // edit mode: store editing key (section + platform)
  const [editingKey, setEditingKey] = useState<{ section: keyof ProfileSections; key: string } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ section: keyof ProfileSections; key: string } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // drag state
  const dragItem = useRef<{ section: keyof ProfileSections; key: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) {
      localStorage.setItem("return-url", "/user/edit");
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data.user;
        setUser(u);
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setJob(u.job || "");

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
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // add link
  const addProfileLink = () => {
    if (!selectedPlatform || !platformValue) return alert("Choose platform and enter value");
    const section = PLATFORM_MAP[selectedPlatform] || "other";
    setProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], [selectedPlatform]: platformValue }
    }));
    setSelectedPlatform("");
    setPlatformValue("");
    setShowAddModal(false);
  };

  // delete with confirm
  const confirmDeleteItem = (section: keyof ProfileSections, key: string) => {
    setConfirmDelete({ section, key });
  };
  const doDelete = () => {
    if (!confirmDelete) return;
    const { section, key } = confirmDelete;
    setProfile(prev => {
      const copy = { ...prev, [section]: { ...prev[section] } };
      delete copy[section][key];
      return copy;
    });
    setConfirmDelete(null);
  };
  const cancelDelete = () => setConfirmDelete(null);

  // inline edit
  const startEdit = (section: keyof ProfileSections, key: string) => {
    setEditingKey({ section, key });
  };
  const saveEdit = (section: keyof ProfileSections, key: string, value: string) => {
    setProfile(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    setEditingKey(null);
  };

  // drag and drop (move platform key between positions inside same section)
  function handleDragStart(e: React.DragEvent, section: keyof ProfileSections, key: string) {
    dragItem.current = { section, key };
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e: React.DragEvent, section: keyof ProfileSections, key: string) {
    e.preventDefault();
    if (!dragItem.current) return;
    const source = dragItem.current;
    if (source.section !== section) {
      // if diff sections -> move key into target section at the end
      setProfile(prev => {
        const srcCopy = { ...prev[source.section] };
        const val = srcCopy[source.key];
        delete srcCopy[source.key];
        const dstCopy = { ...prev[section], [source.key]: val };
        return { ...prev, [source.section]: srcCopy, [section]: dstCopy };
      });
    } else {
      // reorder within same section: rebuild object with moved item
      setProfile(prev => {
        const items = Object.entries(prev[section]);
        const fromIndex = items.findIndex(([k]) => k === source.key);
        const toIndex = items.findIndex(([k]) => k === key);
        if (fromIndex === -1 || toIndex === -1) return prev;
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        const newObj: Record<string,string> = {};
        items.forEach(([k,v]) => (newObj[k] = v));
        return { ...prev, [section]: newObj };
      });
    }
    dragItem.current = null;
  }

  function allowDrop(e: React.DragEvent) { e.preventDefault(); }

  // save to backend
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
      const payload: any = { name, email, phone, job, profile };
      if (password) payload.password = password;
      await api.put("/auth/update", payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("Profile updated");
      // redirect to first QR like previous behavior
      const res2 = await api.get("/qr/my", { headers: { Authorization: `Bearer ${token}` } });
      const codes = res2.data.codes;
      if (!codes || codes.length === 0) { router.push("/"); return; }
      router.push(`/qr/${codes[0]}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return null;

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-sm text-gray-500">Manage your public links and contact info</p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => setShowAddModal(true)} variant="ghost">
                <Plus className="mr-2" size={16} /> Add Link
              </Button>

              <Button onClick={saveProfileToServer} className="bg-green-600" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <Input value={name} onChange={(e:any) => setName(e.target.value)} placeholder="Full name" />
            <Input value={email} onChange={(e:any) => setEmail(e.target.value)} placeholder="Email" />
            <Input value={phone} onChange={(e:any) => setPhone(e.target.value)} placeholder="Phone" />
            <Input value={job} onChange={(e:any) => setJob(e.target.value)} placeholder="Job" />
            <Input value={password} onChange={(e:any) => setPassword(e.target.value)} placeholder="New password (optional)" type="password" />
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          {/* Tabs */}
          <div className="mb-4 border-b">
            <nav className="flex space-x-3">
              {sections.map(s => (
                <button key={s.key} onClick={() => setActiveTab(s.key)}
                  className={`px-3 py-2 rounded-t ${activeTab === s.key ? "bg-white border-t border-l border-r -mb-px text-blue-600" : "text-gray-600 hover:text-gray-800"}`}>
                  {s.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Active Section editor */}
          <div className="bg-white p-4 rounded border">
            <div className="flex flex-col gap-3">
              {Object.entries(profile[activeTab]).length === 0 && <div className="text-gray-500">No links in this section yet. Add one with "Add Link".</div>}

              {Object.entries(profile[activeTab]).map(([plat, val]) => (
                <div key={plat}
                  draggable
                  onDragStart={(e) => handleDragStart(e, activeTab, plat)}
                  onDragOver={allowDrop}
                  onDrop={(e) => handleDrop(e, activeTab, plat)}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Move size={14} className="text-slate-400" />
                      <span>{plat.toUpperCase()}</span>
                    </div>

                    {editingKey && editingKey.section === activeTab && editingKey.key === plat ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={platformValue}
                          onChange={(e:any) => setPlatformValue(e.target.value)}
                          className="w-96"
                        />
                        <IconButton onClick={() => saveEdit(activeTab, plat, platformValue || val)}><Check size={16} /></IconButton>
                        <IconButton onClick={() => { setEditingKey(null); setPlatformValue(""); }}><X size={16} /></IconButton>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <a href={val} target="_blank" rel="noreferrer" className="text-sm text-slate-700 break-all">{val}</a>
                        <div className="text-xs text-gray-400">{PLATFORM_MAP[plat] || "other"}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // prepare inline edit
                        setPlatformValue(val);
                        startEdit(activeTab, plat);
                      }}
                      className="px-2 py-1 border rounded text-sm"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => confirmDeleteItem(activeTab, plat)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>

                    <a href={val} target="_blank" rel="noreferrer" className="px-2 py-1 border rounded text-sm">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* preview */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Public Profile Preview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map(s => (
              <div key={s.key} className="p-3 border rounded">
                <h4 className="font-semibold mb-2">{s.title}</h4>
                <div className="space-y-2">
                  {Object.entries(profile[s.key]).length === 0 ? (
                    <p className="text-sm text-gray-400">—</p>
                  ) : (
                    Object.entries(profile[s.key]).map(([k,v]) => (
                      <div key={k} className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{k.toUpperCase()}</div>
                          <div className="text-xs text-gray-600 break-all">{v}</div>
                        </div>
                        <a href={v} target="_blank" rel="noreferrer" className="text-blue-600 text-sm"><ExternalLink size={14} /></a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Link Dialog (shadcn Dialog usage) */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add new link</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2">
          <Label>Platform</Label>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>

            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>



            <Label>Value (URL / username / phone)</Label>
            <Input value={platformValue} onChange={(e:any) => setPlatformValue(e.target.value)} placeholder="https:// or username or phone" />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={addProfileLink}><Plus className="mr-2" /> Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm modal (simple) */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-3">Delete link?</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to remove <b>{confirmDelete.key}</b> from <b>{confirmDelete.section}</b>?</p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
              <Button className="bg-red-600" onClick={doDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

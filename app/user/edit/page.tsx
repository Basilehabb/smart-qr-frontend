"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  X,
  Check,
  GripVertical,
  Mail,
  User,
  Briefcase,
  Phone,
  Lock,
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
  const [user, setUser] = useState<any>({ name: "Basil Ehab", email: "basilehab.bb@gmail.com" });
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("Basil Ehab");
  const [email, setEmail] = useState("basilehab.bb@gmail.com");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const [password, setPassword] = useState("");

  const [profile, setProfile] = useState<ProfileSections>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<keyof ProfileSections>("social");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [platformValue, setPlatformValue] = useState("");

  const [editingKey, setEditingKey] = useState<{ section: keyof ProfileSections; key: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ section: keyof ProfileSections; key: string } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dragItem = useRef<{ section: keyof ProfileSections; key: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

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

  const startEdit = (section: keyof ProfileSections, key: string) => {
    setPlatformValue(profile[section][key]);
    setEditingKey({ section, key });
  };

  const saveEdit = (section: keyof ProfileSections, key: string, value: string) => {
    setProfile(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    setEditingKey(null);
  };

  function handleDragStart(e: React.DragEvent, section: keyof ProfileSections, key: string) {
    dragItem.current = { section, key };
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e: React.DragEvent, section: keyof ProfileSections, key: string) {
    e.preventDefault();
    setDragOver(null);
    if (!dragItem.current) return;
    const source = dragItem.current;
    
    if (source.section !== section) {
      setProfile(prev => {
        const srcCopy = { ...prev[source.section] };
        const val = srcCopy[source.key];
        delete srcCopy[source.key];
        const dstCopy = { ...prev[section], [source.key]: val };
        return { ...prev, [source.section]: srcCopy, [section]: dstCopy };
      });
    } else {
      setProfile(prev => {
        const items = Object.entries(prev[section]);
        const fromIndex = items.findIndex(([k]) => k === source.key);
        const toIndex = items.findIndex(([k]) => k === key);
        if (fromIndex === -1 || toIndex === -1) return prev;
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        const newObj: Record<string, string> = {};
        items.forEach(([k, v]) => (newObj[k] = v));
        return { ...prev, [section]: newObj };
      });
    }
    dragItem.current = null;
  }

  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }

  const saveProfileToServer = async () => {
    setSaving(true);
    setTimeout(() => {
      alert("Profile updated successfully!");
      setSaving(false);
    }, 1000);
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center"><p className="text-lg text-purple-600">Loading...</p></div>;

  const sections = [
    { key: "social" as keyof ProfileSections, title: "Social", icon: "👥" },
    { key: "contact" as keyof ProfileSections, title: "Communication", icon: "💬" },
    { key: "payment" as keyof ProfileSections, title: "Payment", icon: "💳" },
    { key: "video" as keyof ProfileSections, title: "Video", icon: "🎥" },
    { key: "music" as keyof ProfileSections, title: "Music", icon: "🎵" },
    { key: "design" as keyof ProfileSections, title: "Design", icon: "🎨" },
    { key: "gaming" as keyof ProfileSections, title: "Gaming", icon: "🎮" },
    { key: "other" as keyof ProfileSections, title: "Other", icon: "📎" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
              <p className="text-sm text-gray-500">Manage your contact information</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setShowAddModal(true)} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-200">
              <Plus className="mr-2" size={16} /> Add Field
            </Button>

            <Button 
              onClick={saveProfileToServer} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200" 
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Preview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24 border border-purple-100">
              {/* Card Header with Gradient */}
              <div className="h-32 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 relative">
                <div className="absolute inset-0 bg-black opacity-10"></div>
              </div>

              {/* Profile Info */}
              <div className="px-6 pb-6 -mt-12 relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                  {name.charAt(0)}
                </div>

                <div className="mt-4">
                  <h2 className="text-xl font-bold text-gray-900">{name || "Your Name"}</h2>
                  <p className="text-sm text-gray-500 mt-1">{job || "Your Title"}</p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-purple-500" />
                  <span className="break-all">{email}</span>
                </div>

                {phone && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-purple-500" />
                    <span>{phone}</span>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.values(profile).reduce((acc, section) => acc + Object.keys(section).length, 0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Links</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {sections.filter(s => Object.keys(profile[s.key]).length > 0).length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Categories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">100%</div>
                    <div className="text-xs text-gray-500 mt-1">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-purple-600" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      value={name} 
                      onChange={(e: any) => setName(e.target.value)} 
                      className="pl-10 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      value={email} 
                      onChange={(e: any) => setEmail(e.target.value)} 
                      className="pl-10 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      value={phone} 
                      onChange={(e: any) => setPhone(e.target.value)} 
                      className="pl-10 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200" 
                      placeholder="+1 234 567 8900" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Job Title</Label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      value={job} 
                      onChange={(e: any) => setJob(e.target.value)} 
                      className="pl-10 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200" 
                      placeholder="Software Engineer" 
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">New Password (optional)</Label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      value={password} 
                      onChange={(e: any) => setPassword(e.target.value)} 
                      type="password" 
                      className="pl-10 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200" 
                      placeholder="Leave blank to keep current password" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fields Card with Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Contact Fields</h3>
                <p className="text-sm text-gray-500 mt-1">Organize your links and contact information</p>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100 bg-gray-50">
                <div className="px-6 overflow-x-auto">
                  <nav className="flex gap-1 -mb-px">
                    {sections.map(s => {
                      const count = Object.keys(profile[s.key]).length;
                      return (
                        <button
                          key={s.key}
                          onClick={() => setActiveTab(s.key)}
                          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                            activeTab === s.key
                              ? "border-purple-600 text-purple-600 bg-white"
                              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <span className="mr-2">{s.icon}</span>
                          {s.title}
                          {count > 0 && (
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              activeTab === s.key ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-600"
                            }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 min-h-[300px]">
                {Object.entries(profile[activeTab]).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl">{sections.find(s => s.key === activeTab)?.icon}</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No fields yet</h4>
                    <p className="text-sm text-gray-500 mb-4">Add your first {activeTab} link to get started</p>
                    <Button 
                      onClick={() => setShowAddModal(true)} 
                      variant="outline" 
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="mr-2" size={16} /> Add Field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(profile[activeTab]).map(([plat, val]) => (
                      <div
                        key={plat}
                        draggable
                        onDragStart={(e) => handleDragStart(e, activeTab, plat)}
                        onDragOver={(e) => {
                          allowDrop(e);
                          setDragOver(plat);
                        }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => handleDrop(e, activeTab, plat)}
                        className={`group flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 cursor-move ${
                          dragOver === plat ? "ring-2 ring-purple-400 bg-purple-50" : ""
                        }`}
                      >
                        <GripVertical size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />

                        <div className="flex-1 min-w-0">
                          {editingKey && editingKey.section === activeTab && editingKey.key === plat ? (
                            <div className="flex gap-2 items-center">
                              <Input
                                value={platformValue}
                                onChange={(e: any) => setPlatformValue(e.target.value)}
                                className="flex-1 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEdit(activeTab, plat, platformValue || val)}
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingKey(null);
                                  setPlatformValue("");
                                }}
                                className="px-3 py-2 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm font-semibold text-gray-900 uppercase mb-1">
                                {plat}
                              </div>
                              <a
                                href={val}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-700 break-all hover:underline"
                              >
                                {val}
                              </a>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(activeTab, plat)}
                            className="p-2 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => confirmDeleteItem(activeTab, plat)}
                            className="p-2 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>

                          <a
                            href={val}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-purple-100 rounded-md transition-colors"
                          >
                            <ExternalLink size={14} className="text-purple-600" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Field</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-full border-gray-200 focus:border-purple-400 focus:ring-purple-400">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">URL or Value</Label>
              <Input
                value={platformValue}
                onChange={(e: any) => setPlatformValue(e.target.value)}
                placeholder="https://example.com or @username"
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={addProfileLink}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="mr-2" size={16} /> Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Field?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-900">{confirmDelete.key}</span> from{" "}
              <span className="font-semibold text-gray-900">{confirmDelete.section}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={cancelDelete} className="flex-1">
                Cancel
              </Button>
              <Button onClick={doDelete} className="flex-1 bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
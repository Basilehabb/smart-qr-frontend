"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AdminSidebar from "../../AdminSidebar";
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
  social: Record<string, string | null>;
  contact: Record<string, string | null>;
  payment: Record<string, string | null>;
  video: Record<string, string | null>;
  music: Record<string, string | null>;
  design: Record<string, string | null>;
  gaming: Record<string, string | null>;
  other: Record<string, string | null>;
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

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [qrs, setQrs] = useState<any[]>([]);
  const [allQrs, setAllQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    job: "",
    avatar: "",
  });

  // ⭐⭐ AVATAR STATES (الإضافة الوحيدة)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileSections>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<keyof ProfileSections>("social");
  const [deletedBuffer, setDeletedBuffer] = useState<Record<string, Record<string, string>>>({});
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const dragItem = useRef<{ section: keyof ProfileSections; key: string } | null>(null);
  const [selectedQR, setSelectedQR] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) return router.push("/login");

    (async () => {
      try {
        const usersRes = await api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const foundUser = usersRes.data.users.find((u: any) => u._id === userId);
        if (!foundUser) return router.push("/admin/users");

        setUser(foundUser);

        setEditData({
          name: foundUser.name || "",
          email: foundUser.email || "",
          phone: foundUser.phone || "",
          job: foundUser.job || "",
          avatar: foundUser.avatar || "",
        });

        if (foundUser.avatar) {
          setAvatarPreview(foundUser.avatar);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router, userId]);

  function onAvatarChange(file?: File) {
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function uploadAvatarAdmin() {
    if (!avatarFile) return null;
    const token = localStorage.getItem("admin-token");
    const fd = new FormData();
    fd.append("file", avatarFile);

    const res = await api.post(
      `/admin/users/${userId}/avatar`,
      fd,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.url;
  }

  const saveUser = async () => {
    const token = localStorage.getItem("admin-token");

    let avatarUrl = editData.avatar;
    if (avatarFile) {
      const uploaded = await uploadAvatarAdmin();
      if (uploaded) avatarUrl = uploaded;
    }

    await api.put(
      `/admin/users/${userId}`,
      {
        ...editData,
        avatar: avatarUrl,
        profile,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("User updated successfully");
    window.location.reload();
  };

  if (loading) return <p className="text-center mt-20">Loading user...</p>;
  if (!user) return <p className="text-center text-red-600 mt-20">User not found</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>

            {isEditing && (
              <>
                {/* ⭐⭐ AVATAR UPLOAD – الإضافة الوحيدة في UI */}
                <div className="flex items-center gap-4 mb-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      ?
                    </div>
                  )}

                  <label className="px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer">
                    Upload photo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onAvatarChange(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <button
                  onClick={saveUser}
                  className="px-6 py-2 bg-green-600 text-white rounded"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

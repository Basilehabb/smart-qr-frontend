"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

/* =====================
   Dynamic Links Config
===================== */
const LINK_SECTIONS = {
  social: [
    { key: "instagram", label: "Instagram" },
    { key: "facebook", label: "Facebook" },
    { key: "tiktok", label: "TikTok" },
    { key: "youtube", label: "YouTube" },
  ],
  contact: [
    { key: "whatsapp", label: "WhatsApp" },
    { key: "email", label: "Public Email" },
    { key: "phone", label: "Phone" },
  ],
  payment: [{ key: "paypal", label: "PayPal" }],
  other: [{ key: "website", label: "Website" }],
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const from = searchParams.get("from"); // admin | null

  /* ========= BASIC DATA ========= */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    job: "",
  });

  /* ========= PROFILE LINKS ========= */
  const [profile, setProfile] = useState<any>({
    social: {},
    contact: {},
    payment: {},
    other: {},
  });

  /* ========= AVATAR ========= */
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================
     HANDLE SUBMIT
  ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      /* 1️⃣ REGISTER (basic only) */
      await axios.post(`${API}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        job: formData.job,
      });

      /* Admin creates user only */
      if (from === "admin") {
        router.push("/admin/users");
        return;
      }

      /* 2️⃣ LOGIN */
      const loginRes = await axios.post(`${API}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      const token = loginRes.data.token;
      localStorage.setItem("user-token", token);

      /* 3️⃣ UPDATE PROFILE (ALL LINKS 🔥) */
      await axios.put(
        `${API}/auth/update`,
        { profile },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      /* 4️⃣ UPLOAD AVATAR */
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);

        await axios.post(`${API}/auth/upload-avatar`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      /* 5️⃣ LINK QR */
      if (code) {
        await axios.post(
          `${API}/qr/link`,
          { code },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        router.push(`/qr/${code}`);
        return;
      }

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-8 space-y-6">

        <h2 className="text-3xl font-bold text-center">
          {from === "admin" ? "Create User" : "Create Account"}
        </h2>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ===== BASIC INFO ===== */}
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Full Name" required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input" />

            <input type="email" placeholder="Email" required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input" />

            <input type="password" placeholder="Password" required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input" />

            <input placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input" />

            <input placeholder="Job"
              value={formData.job}
              onChange={(e) => setFormData({ ...formData, job: e.target.value })}
              className="input col-span-2" />
          </div>

          {/* ===== AVATAR ===== */}
          <div className="flex items-center gap-4">
            {avatarPreview && (
              <img src={avatarPreview} className="w-16 h-16 rounded-full object-cover" />
            )}
            <label className="btn-secondary cursor-pointer">
              Upload Avatar
              <input hidden type="file" accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setAvatarFile(f);
                  setAvatarPreview(URL.createObjectURL(f));
                }} />
            </label>
          </div>

          {/* ===== PROFILE LINKS ===== */}
          {Object.entries(LINK_SECTIONS).map(([section, fields]) => (
            <div key={section}>
              <h3 className="font-semibold mb-2 capitalize">{section}</h3>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((f) => (
                  <input
                    key={f.key}
                    placeholder={f.label}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        [section]: {
                          ...profile[section],
                          [f.key]: e.target.value,
                        },
                      })
                    }
                    className="input"
                  />
                ))}
              </div>
            </div>
          ))}

          <button disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded font-bold">
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =====================
   PAGE WRAPPER
===================== */
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");
  const from = searchParams.get("from"); // admin | null

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    job: "",
    countryCode: "+20",

    profile: {
      social: {
        instagram: "",
        facebook: "",
        tiktok: "",
        youtube: "",
      },
      contact: {
        phone: "",
        whatsapp: "",
        email: "",
      },
      payment: {
        paypal: "",
      },
      video: {},
      music: {},
      design: {},
      gaming: {},
      other: {},
    },
  });

  const updateProfile = (
    section: string,
    key: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [section]: {
          ...(prev.profile as any)[section],
          [key]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1️⃣ Register (كل الداتا مرة واحدة)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        formData
      );

      // ✅ Admin flow
      if (from === "admin") {
        router.push("/admin/users");
        return;
      }

      // 2️⃣ Login (user)
      const loginRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const token = loginRes.data.token;
      const user = loginRes.data.user;

      localStorage.setItem("user-token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 3️⃣ Upload avatar
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);

        const avatarRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/upload-avatar`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        user.avatar = avatarRes.data.url;
        localStorage.setItem("user", JSON.stringify(user));
      }

      // 4️⃣ Link QR
      if (code) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/qr/link`,
          { code },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        router.push(`/qr/${code}`);
        return;
      }

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow p-8 space-y-6">

        <h1 className="text-2xl font-bold text-center">
          {from === "admin" ? "Create User" : "Create Account"}
        </h1>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* BASIC INFO */}
          <input
            placeholder="Full Name"
            required
            className="input"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            required
            className="input"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="input"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <input
            placeholder="Phone"
            className="input"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <input
            placeholder="Job"
            className="input"
            value={formData.job}
            onChange={(e) =>
              setFormData({ ...formData, job: e.target.value })
            }
          />

          {/* AVATAR */}
          <div className="flex items-center gap-4">
            {avatarPreview && (
              <img
                src={avatarPreview}
                className="w-14 h-14 rounded-full object-cover"
              />
            )}
            <label className="px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer">
              Upload Avatar
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setAvatarFile(file);
                  const reader = new FileReader();
                  reader.onload = () =>
                    setAvatarPreview(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>

          {/* SOCIAL */}
          <h3 className="font-semibold">Social Links</h3>
          <input className="input" placeholder="Instagram"
            onChange={(e)=>updateProfile("social","instagram",e.target.value)} />
          <input className="input" placeholder="Facebook"
            onChange={(e)=>updateProfile("social","facebook",e.target.value)} />
          <input className="input" placeholder="TikTok"
            onChange={(e)=>updateProfile("social","tiktok",e.target.value)} />

          {/* CONTACT */}
          <h3 className="font-semibold">Contact</h3>
          <input className="input" placeholder="WhatsApp"
            onChange={(e)=>updateProfile("contact","whatsapp",e.target.value)} />
          <input className="input" placeholder="Public Email"
            onChange={(e)=>updateProfile("contact","email",e.target.value)} />

          {/* PAYMENT */}
          <h3 className="font-semibold">Payment</h3>
          <input className="input" placeholder="PayPal"
            onChange={(e)=>updateProfile("payment","paypal",e.target.value)} />

          <button
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded font-semibold"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

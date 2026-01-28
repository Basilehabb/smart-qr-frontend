"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");
  const from = searchParams.get("from"); // ✅ admin | null

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    job: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      /* 1️⃣ REGISTER */
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          job: formData.job,
        }
      );

      /* ✅ لو Admin */
      if (from === "admin") {
        router.push("/admin/users");
        return;
      }

      /* 2️⃣ LOGIN (User only) */
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

      /* 3️⃣ UPDATE phone + job */
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update`,
        {
          phone: formData.phone,
          job: formData.job,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /* 4️⃣ UPLOAD AVATAR */
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

      /* 5️⃣ LINK QR (optional) */
      if (code) {
        const linkRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/qr/link`,
          { code },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (linkRes.data.status === "already_linked") {
          setError("This QR code is already linked to another user");
          setLoading(false);
          return;
        }

        router.push(`/qr/${code}`);
        return;
      }

      /* 6️⃣ REDIRECT */
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">

        <h2 className="text-3xl font-bold text-center">
          {from === "admin" ? "Create User" : "Create Account"}
        </h2>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Full Name"
            className="w-full px-4 py-3 border rounded"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded"
            minLength={6}
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <input
            placeholder="Phone"
            className="w-full px-4 py-3 border rounded"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <input
            placeholder="Job"
            className="w-full px-4 py-3 border rounded"
            value={formData.job}
            onChange={(e) =>
              setFormData({ ...formData, job: e.target.value })
            }
          />

          {/* Avatar */}
          <div className="flex items-center gap-4">
            {avatarPreview && (
              <img
                src={avatarPreview}
                className="w-14 h-14 rounded-full border object-cover"
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

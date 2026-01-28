"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");

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
      // 1️⃣ Register
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        formData
      );

      // 2️⃣ Login
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

      // 3️⃣ Upload avatar (optional)
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);

        const avatarRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users/avatar`,
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

      // 4️⃣ Link QR (if exists)
      if (code) {
        const linkRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/qr/link`,
          { code },
          {
            headers: { Authorization: `Bearer ${token}` },
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

      // 5️⃣ Redirect
      router.push(`/qr/${code}`);
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

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          {code && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                📱 Linking QR Code
              </p>
              <p className="text-xs text-blue-600 mt-1 font-mono">{code}</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <input
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          {/* Email */}
          <input
            type="email"
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          {/* Password */}
          <input
            type="password"
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Password"
            minLength={6}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          {/* Phone */}
          <input
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          {/* Job */}
          <input
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Job"
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
                className="w-14 h-14 rounded-full object-cover border"
              />
            )}

            <label className="px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer">
              Upload Avatar
              <input
                type="file"
                hidden
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

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a
            href={code ? `/login?code=${code}` : "/login"}
            className="text-blue-600 font-medium"
          >
            Sign in
          </a>
        </p>
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

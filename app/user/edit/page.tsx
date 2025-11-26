"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function EditProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  // =========================
  // Load User Data
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("user-token");

    if (!token) {
      // المستخدم مش عامل Login → لازم نرجع هنا بعد login
      localStorage.setItem("return-url", "/user/edit");
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
        setName(res.data.user.name || "");
        setEmail(res.data.user.email || "");
        setPhone(res.data.user.phone || "");
        setJob(res.data.user.job || "");
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // =========================
  // CANCEL → return to QR
  // =========================
  const goBackToQR = async () => {
    const token = localStorage.getItem("user-token");

    if (!token) {
      localStorage.setItem("return-url", "/user/edit");
      router.push("/login");
      return;
    }

    const res = await api.get("/qr/my", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const codes = res.data.codes;

    if (!codes || codes.length === 0) {
      router.push("/");
      return;
    }

    router.push(`/qr/${codes[0]}`);
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const saveProfile = async () => {
    try {
      setError(null);

      const token = localStorage.getItem("user-token");

      await api.put(
        "/auth/update",
        {
          name,
          email,
          phone,
          job,
          password: password || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // بعد التعديل → لازم نجيب الـ QR ونرجع له
      const res2 = await api.get("/qr/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const codes = res2.data.codes;

      if (!codes || codes.length === 0) {
        router.push("/");
        return;
      }

      router.push(`/qr/${codes[0]}`);

    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update profile");
    }
  };

  // =========================
  // RENDER
  // =========================
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-lg p-6 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>

        <input
          className="border w-full rounded px-3 py-2 mb-2"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border w-full rounded px-3 py-2 mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border w-full rounded px-3 py-2 mb-2"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="border w-full rounded px-3 py-2 mb-2"
          placeholder="Job"
          value={job}
          onChange={(e) => setJob(e.target.value)}
        />

        <input
          className="border w-full rounded px-3 py-2 mb-3"
          placeholder="New Password (optional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
          onClick={saveProfile}
        >
          Save Changes
        </button>

        <button
          className="border w-full py-2 rounded mt-3"
          onClick={goBackToQR}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

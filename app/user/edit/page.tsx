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

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem("user-token");

    // المستخدم مش لوجين → نرجع return-url لصفحة edit نفسها
    if (!token) {
      localStorage.setItem(
        "return-url",
        window.location.pathname + window.location.search
      );
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

  // Return to QR
  const getQRDetails = async () => {
    const token = localStorage.getItem("user-token");

    if (!token) return router.push("/");

    const res = await api.get("/qr/my", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const code = res.data.code;
    if (code) router.push(`/qr/${code}`);
    else router.push("/");
  };

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await getQRDetails();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update profile");
    }
  };

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
          onClick={getQRDetails}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

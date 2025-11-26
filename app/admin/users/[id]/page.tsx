"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AdminSidebar from "../../AdminSidebar";

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
  });

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
        });

        const qrRes = await api.get("/admin/qrs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAllQrs(qrRes.data);

        setQrs(qrRes.data.filter((qr: any) => qr.userId?._id === userId));

      } catch (err) {
        console.error(err);
        router.push("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [router, userId]);

  const saveUser = async () => {
    const token = localStorage.getItem("admin-token");

    await api.patch(`/admin/users/${userId}`, editData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("User updated successfully");

    setUser({ ...user, ...editData });
    setIsEditing(false);
  };

  const createQRForUser = async () => {
    const token = localStorage.getItem("admin-token");

    const res = await api.post(
      `/admin/users/${userId}/qrs`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("QR Created & Linked: " + res.data.qr.code);
    router.refresh();
  };

  const linkExistingQR = async () => {
    if (!selectedQR) return alert("Please select a QR code");

    const token = localStorage.getItem("admin-token");

    await api.patch(
      `/admin/users/${userId}/qrs/link`,
      { code: selectedQR },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("QR Linked!");
    router.refresh();
  };

  const unlinkQR = async (code: string) => {
    const token = localStorage.getItem("admin-token");

    await api.patch(`/admin/qrs/${code}/unlink`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("QR Unlinked");
    router.refresh();
  };

  const deleteUser = async () => {
    if (!confirm("Are you sure?")) return;

    const token = localStorage.getItem("admin-token");

    await api.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("User deleted");
    router.push("/admin/users");
  };

  // 🚀 ADD — Reset Password
  const resetPassword = async () => {
    const token = localStorage.getItem("admin-token");

    const res = await api.post(
      `/admin/users/${userId}/reset-password`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Temporary Password: " + res.data.tempPassword);
  };

  if (loading)
    return <p className="text-center mt-20">Loading user...</p>;

  if (!user)
    return (
      <p className="text-center text-red-600 mt-20">User not found</p>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">User: {user.name}</h1>
            <button
              className="text-blue-600 underline"
              onClick={() => router.push("/admin/users")}
            >
              Back
            </button>
          </div>

          <div className="bg-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">User Details</h2>

              {!isEditing && (
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => setIsEditing(true)}
                >
                  Edit User
                </button>
              )}
            </div>

            {!isEditing ? (
              <>
                <p><b>Name:</b> {user.name}</p>
                <p><b>Email:</b> {user.email}</p>
                {user.phone && <p><b>Phone:</b> {user.phone}</p>}
                {user.job && <p><b>Job:</b> {user.job}</p>}

                {/* RESET PASSWORD BUTTON */}
                <button
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded"
                  onClick={resetPassword}
                >
                  Reset Password
                </button>

                <button
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                  onClick={deleteUser}
                >
                  Delete User
                </button>
              </>
            ) : (
              <>
                {/* Editing form unchanged */}
              </>
            )}
          </div>

          {/* QR SECTION — unchanged */}
        </div>
      </div>
    </div>
  );
}

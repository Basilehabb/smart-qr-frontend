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
        // 1) get users
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

        // 2) get ALL qrs
        const qrRes = await api.get("/admin/qrs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAllQrs(qrRes.data);

        // filter linked
        setQrs(qrRes.data.filter((qr: any) => qr.userId?._id === userId));
      } catch {
        router.push("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [router, userId]);

  // ========================
  // UPDATE USER
  // ========================
  const saveUser = async () => {
    const token = localStorage.getItem("admin-token");

    await api.patch(`/admin/users/${userId}`, editData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("User updated successfully");

    setUser({ ...user, ...editData });
    setIsEditing(false);
  };

  // ========================
  // CREATE NEW QR FOR USER
  // ========================
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

  // ========================
  // LINK EXISTING QR TO USER
  // ========================
  const linkExistingQR = async () => {
    if (!selectedQR) return alert("Select a QR");

    const token = localStorage.getItem("admin-token");

    await api.patch(
      `/admin/users/${userId}/qrs/link`,
      { code: selectedQR },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("QR Linked!");
    router.refresh();
  };

  // ========================
  // UNLINK QR
  // ========================
  const unlinkQR = async (code: string) => {
    const token = localStorage.getItem("admin-token");

    await api.patch(`/admin/qrs/${code}/unlink`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("QR Unlinked");
    router.refresh();
  };

  // ========================
  // DELETE USER
  // ========================
  const deleteUser = async () => {
    if (!confirm("Are you sure?")) return;

    const token = localStorage.getItem("admin-token");

    await api.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("User deleted");
    router.push("/admin/users");
  };

  // ========================
  // RESET PASSWORD
  // ========================
  const resetPassword = async () => {
    const token = localStorage.getItem("admin-token");

    const res = await api.post(
      `/admin/users/${userId}/reset-password`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Temporary Password: " + res.data.tempPassword);
  };

  // ========================
  // RENDER
  // ========================
  if (loading)
    return <p className="text-center mt-20">Loading user...</p>;

  if (!user)
    return (
      <p className="text-center text-red-600 mt-20">
        User not found
      </p>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">User: {user.name}</h1>

            <button
              className="text-blue-600 underline"
              onClick={() => router.push("/admin/users")}
            >
              Back
            </button>
          </div>

          {/* USER CARD */}
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
                <input
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />

                <input
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />

                <input
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />

                <input
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editData.job}
                  onChange={(e) => setEditData({ ...editData, job: e.target.value })}
                />

                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={saveUser}
                  >
                    Save
                  </button>

                  <button
                    className="px-4 py-2 border rounded"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          {/* QR SECTION */}
          <div className="bg-white p-5 rounded-lg shadow">

            <h2 className="text-xl font-semibold mb-3">
              Linked QR Codes ({qrs.length})
            </h2>

            {/* Create + Link */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={createQRForUser}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Create QR for this User
              </button>

              <select
                className="border px-3 py-2 rounded"
                value={selectedQR}
                onChange={(e) => setSelectedQR(e.target.value)}
              >
                <option value="">Select QR to Link</option>
                {allQrs
                  .filter((qr) => !qr.userId)
                  .map((qr) => (
                    <option key={qr.code} value={qr.code}>
                      {qr.code}
                    </option>
                  ))}
              </select>

              <button
                onClick={linkExistingQR}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Link
              </button>
            </div>

            {/* QR LIST */}
            {qrs.length === 0 ? (
              <p className="text-gray-500">No QR codes linked.</p>
            ) : (
              <ul className="space-y-3">
                {qrs.map((qr) => (
                  <li
                    key={qr.code}
                    className="p-3 border rounded flex justify-between items-center bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{qr.code}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(qr.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        className="px-3 py-1 border rounded"
                        onClick={() => router.push(`/admin/qr/${qr.code}`)}
                      >
                        Open
                      </button>

                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                        onClick={() => unlinkQR(qr.code)}
                      >
                        Unlink
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import AdminSidebar from "../AdminSidebar";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newJob, setNewJob] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) return router.push("/login");

    (async () => {
      try {
        const res = await api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(res.data.users);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // ==========================
  // Delete User
  // ==========================
  const deleteUser = async (userId: string) => {
    if (!confirm("هل تريد حذف هذا المستخدم؟")) return;

    const token = localStorage.getItem("admin-token");

    await api.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  // ==========================
  // Create User
  // ==========================
  const createUser = async () => {
    const token = localStorage.getItem("admin-token");

    if (!newName || !newEmail || !newPassword) {
      alert("Name, Email, and Password are required");
      return;
    }

    try {
      const res = await api.post(
        "/admin/users",
        {
          name: newName,
          email: newEmail,
          phone: newPhone,
          job: newJob,
          password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add new user to list without reload
      setUsers((prev) => [...prev, res.data.user]);

      // Reset form + close modal
      setShowCreateModal(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewJob("");
      setNewPassword("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="bg-white p-5 rounded shadow">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Users</h1>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                + Create User
              </button>
            </div>

            <input
              className="border px-3 py-2 rounded w-full mb-4"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="bg-white rounded shadow">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-600">
                    <th className="p-3">Name</th>
                    <th>Email</th>
                    <th>QRs</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b hover:bg-gray-50 text-sm"
                    >
                      <td className="p-3">{user.name}</td>
                      <td>{user.email}</td>

                      <td>{user.qrCount ?? 0}</td>

                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/users/${user._id}`)
                          }
                          className="px-3 py-1 rounded bg-blue-600 text-white"
                        >
                          View
                        </button>

                        <button
                          onClick={() => deleteUser(user._id)}
                          className="px-3 py-1 rounded bg-red-600 text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <p className="p-4 text-center text-gray-500">No users found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================
          CREATE USER MODAL
      ========================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">

            <h2 className="text-xl font-semibold mb-4">Create User</h2>

            <input
              className="border px-3 py-2 rounded w-full mb-3"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <input
              className="border px-3 py-2 rounded w-full mb-3"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <input
              className="border px-3 py-2 rounded w-full mb-3"
              placeholder="Phone (optional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />

            <input
              className="border px-3 py-2 rounded w-full mb-3"
              placeholder="Job (optional)"
              value={newJob}
              onChange={(e) => setNewJob(e.target.value)}
            />

            <input
              className="border px-3 py-2 rounded w-full mb-4"
              placeholder="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={createUser}
              >
                Create
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

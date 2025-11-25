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

  const deleteUser = async (userId: string) => {
    if (!confirm("هل تريد حذف هذا المستخدم؟")) return;

    const token = localStorage.getItem("admin-token");

    await api.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="bg-white p-5 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Users</h1>

            <input
              className="border px-3 py-2 rounded w-full mb-4"
              placeholder="Search users by name or email..."
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
    </div>
  );
}

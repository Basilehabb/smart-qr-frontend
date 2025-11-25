"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { title: "Dashboard", path: "/admin/dashboard" },
    { title: "Users", path: "/admin/users" },
    { title: "QR Codes", path: "/admin/qrs" },
    { title: "Scan Analytics", path: "/admin/scan-analytics" },
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  const logout = () => {
    localStorage.removeItem("admin-token");
    router.push("/login");
  };

  return (
    <div className="w-60 min-h-screen bg-white shadow-md p-5 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <nav className="flex-1 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-3 py-2 rounded ${
              isActive(item.path)
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-4 px-3 py-2 w-full border rounded text-red-600 hover:bg-red-50"
      >
        Logout
      </button>
    </div>
  );
}

"use client";

export default function EditButton() {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={() => {
        const token = localStorage.getItem("user-token");

        if (token) {
          // 🔥 لو المستخدم مسجل دخول → يروح مباشرة على صفحة edit الجديدة
          window.location.href = "/user/edit";
        } else {
          // 🔥 لو مش مسجل دخول → نخزن return-url ثم نوديه للـ login
          localStorage.setItem("return-url", "/user/edit");
          window.location.href = "/login";
        }
      }}
    >
      Edit Profile
    </button>
  );
}

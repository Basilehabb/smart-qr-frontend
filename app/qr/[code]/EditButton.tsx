"use client";

export default function EditButton() {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={() => {
        localStorage.setItem("return-url", "/user/edit");  // ← ثابت
        window.location.href = "/login";
      }}
    >
      Edit Profile
    </button>
  );
}

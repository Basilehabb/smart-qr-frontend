"use client";

export default function EditButton() {
  const handleClick = () => {
    localStorage.setItem("return-url", "/user/edit");
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Edit Profile
    </button>
  );
}

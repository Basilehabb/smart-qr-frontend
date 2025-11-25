"use client";
import React from "react";

export default function EditButton() {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={() => {
        const currentCode = window.location.pathname.split("/").pop();
        localStorage.setItem("return-url", `/qr/${currentCode}`);
        window.location.href = "/login";
      }}
    >
      Edit Profile
    </button>
  );
}

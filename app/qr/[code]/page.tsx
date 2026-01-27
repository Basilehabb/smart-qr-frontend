import React from "react";
import EditButton from "./EditButton";
import {
  FaInstagram,
  FaPhoneAlt,
} from "react-icons/fa";

type Props = { params: { code: string } };

async function fetchQr(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${code}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("QR not found");
  return res.json();
}

export default async function Page({ params }: Props) {
  const data = await fetchQr(params.code);
  const user = data.user;

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="relative h-[320px] overflow-hidden">

          {/* Image */}
          {user.avatar && (
            <img
              src={user.avatar}
              alt="cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* SVG = البنفسجي + الكيرف + الأبيض */}
          <svg
            viewBox="0 0 246 120"
            preserveAspectRatio="xMinYMax meet"
            className="absolute bottom-0 left-0 w-full h-[140px]"
          >
            {/* Purple wave (behind image) */}
            <path
              d="m 0,30 v 60
                 C 45,120 82,122 138,70
                 193,18 219,24 246,40
                 V 0
                 H 0 Z"
              fill="#8F60DE"
            />

            {/* White cut */}
            <path
              d="M 0,60
                 C 45,90 82,92 138,60
                 193,28 219,34 246,50
                 L 246,120
                 L 0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-6 pt-6 pb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.name}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {user.job}
          </p>

          <div className="space-y-4 mb-6">
            <a className="flex items-center gap-4 px-6 py-4 rounded-full bg-purple-600 text-white">
              <FaInstagram />
              Instagram
            </a>

            <a className="flex items-center gap-4 px-6 py-4 rounded-full bg-purple-600 text-white">
              <FaPhoneAlt />
              Phone
            </a>
          </div>

          <EditButton />
        </div>
      </div>
    </main>
  );
}

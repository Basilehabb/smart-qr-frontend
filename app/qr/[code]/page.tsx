import React from "react";
import EditButton from "./EditButton";
import LoginToLinkButton from "./LoginToLinkButton";

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaGlobe,
  FaPhoneAlt,
  FaYoutube,
  FaPaypal,
  FaSpotify,
  FaGamepad,
  FaLink,
} from "react-icons/fa";

type Props = { params: { code: string } };

async function fetchQr(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${code}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("QR not found");
  return res.json();
}

/* ===== Platform titles ===== */
const PLATFORM_TITLES: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  website: "Website",
  phone: "Phone",
  youtube: "YouTube",
  paypal: "PayPal",
  spotify: "Spotify",
};

/* ===== Platform icons ===== */
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <FaWhatsapp className="text-green-600" />,
  instagram: <FaInstagram className="text-pink-500" />,
  facebook: <FaFacebook className="text-blue-600" />,
  tiktok: <FaTiktok className="text-black" />,
  website: <FaGlobe className="text-gray-600" />,
  phone: <FaPhoneAlt className="text-gray-600" />,
  youtube: <FaYoutube className="text-red-600" />,
  paypal: <FaPaypal className="text-blue-500" />,
  spotify: <FaSpotify className="text-green-600" />,
  gaming: <FaGamepad className="text-purple-600" />,
  other: <FaLink className="text-gray-500" />,
};

/* ===== Link Row ===== */
function LinkItem({
  title,
  value,
  platform,
}: {
  title: string;
  value: string;
  platform: string;
}) {
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex items-center gap-4
        w-full px-4 py-3
        rounded-xl
        bg-white border border-gray-200
        hover:bg-gray-50
        transition
      "
    >
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
        {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
      </div>

      <span className="font-medium text-gray-800">{title}</span>
    </a>
  );
}

export default async function Page({ params }: Props) {
  const code = params.code;

  try {
    const data = await fetchQr(code);

    /* ===== QR not linked ===== */
    if (!data.user) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-2">
              هذا الـ QR غير مربوط
            </h2>
            <p className="text-gray-600 mb-6">
              يمكنك تسجيل حساب جديد أو تسجيل دخول لربط هذا QR.
            </p>

            <div className="flex justify-center gap-4">
              <a
                href={`/register?code=${code}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Register & Link
              </a>

              <LoginToLinkButton code={code} />
            </div>
          </div>
        </main>
      );
    }

    const user = data.user;
    const profile = user.profile || {};

    /* ===== Collect all links (no sections) ===== */
    const allLinks = Object.entries(profile).flatMap(([_, group]) =>
      Object.entries(group || {}).filter(
        ([_, v]) => v && String(v).trim() !== ""
      )
    );

    return (
      <main className="min-h-screen bg-gray-100 flex justify-center px-4 py-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-[420px] overflow-hidden">

          {/* ===== Header ===== */}
          <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-500">
            <svg
              className="absolute bottom-0 w-full"
              viewBox="0 0 1440 100"
              fill="none"
            >
              <path
                fill="#fff"
                d="M0,40 C240,80 480,0 720,20 960,40 1200,80 1440,40 L1440,100 L0,100 Z"
              />
            </svg>
          </div>

          {/* ===== Avatar ===== */}
          <div className="relative flex justify-center -mt-14">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="
                  w-28 h-28 rounded-full
                  border-4 border-white
                  shadow-lg object-cover
                "
              />
            ) : (
              <div
                className="
                  w-28 h-28 rounded-full bg-gray-300
                  flex items-center justify-center
                  text-4xl font-bold text-white
                  border-4 border-white shadow-lg
                "
              >
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* ===== Name ===== */}
          <div className="text-center mt-4 mb-6 px-6">
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            {user.job && (
              <p className="text-gray-500 text-sm mt-1">{user.job}</p>
            )}
          </div>

          {/* ===== Links ===== */}
          <div className="px-6 space-y-3">
            {allLinks.map(([key, value]) => (
              <LinkItem
                key={key}
                platform={key}
                title={PLATFORM_TITLES[key] || key}
                value={String(value)}
              />
            ))}
          </div>

          {/* ===== Save Contact ===== */}
          <div className="px-6 mt-6">
            <a
              href={`/api/vcard/${user.id}`}
              className="
                block w-full text-center
                bg-indigo-600 text-white
                py-3 rounded-xl
                font-semibold
                hover:bg-indigo-700 transition
              "
            >
              Save Contact
            </a>
          </div>

          {/* ===== Edit ===== */}
          <div className="text-center mt-4 mb-6">
            <EditButton />
          </div>
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h2 className="text-lg font-semibold">هذا الـ QR غير موجود</h2>
          <p className="text-gray-600">
            تأكد من الكود أو تواصل مع الدعم.
          </p>
        </div>
      </main>
    );
  }
}

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
  FaEnvelope,
} from "react-icons/fa";

type Props = { params: { code: string } };

async function fetchQr(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${code}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("QR not found");
  return res.json();
}

/* ===== Titles ===== */
const PLATFORM_TITLES: Record<string, string> = {
  instagram: "Instagram",
  phone: "Phone",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  tiktok: "TikTok",
  website: "Website",
  youtube: "YouTube",
  paypal: "PayPal",
  spotify: "Spotify",
  email: "Email",
};

/* ===== Icons ===== */
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <FaInstagram />,
  phone: <FaPhoneAlt />,
  whatsapp: <FaWhatsapp />,
  facebook: <FaFacebook />,
  tiktok: <FaTiktok />,
  website: <FaGlobe />,
  youtube: <FaYoutube />,
  paypal: <FaPaypal />,
  spotify: <FaSpotify />,
  gaming: <FaGamepad />,
  email: <FaEnvelope />,
  other: <FaLink />,
};

/* ===== Link Item ===== */
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
        w-full px-6 py-4
        rounded-full
        bg-gradient-to-r from-purple-600 to-purple-700
        text-white font-medium
        shadow-md
      "
    >
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
        {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
      </div>
      <span className="flex-1 text-left">{title}</span>
    </a>
  );
}

export default async function Page({ params }: Props) {
  const code = params.code;
  const data = await fetchQr(code);

  if (!data.user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoginToLinkButton code={code} />
      </main>
    );
  }

  const user = data.user;
  const profile = user.profile || {};

  const allLinks = Object.entries(profile).flatMap(([_, group]) =>
    Object.entries(group || {}).filter(
      ([_, v]) => v && String(v).trim() !== ""
    )
  );

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden">

          {/* Purple background */}
          <div className="absolute inset-0 bg-[#8F60DE]" />

          {/* Cover image */}
          {user.avatar && (
            <img
              src={user.avatar}
              alt="cover"
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          )}

          {/* Height holder */}
          <div className="h-[300px]" />

          {/* HiHello EXACT wave */}
          <div className="absolute bottom-[-1px] left-0 w-full z-20">
            <svg
              viewBox="0 0 246 57"
              preserveAspectRatio="none"
              className="w-full h-[90px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* white right */}
              <path
                d="M 214.7168,6.1113281
                   C 195.65271,5.9023124 172.37742,11.948182
                   137.87305,32.529297
                   110.16613,49.05604 86.980345,56.862784
                   65.015625,57
                   H 65 v 1 H 246 V 11.453125
                   C 236.0775,8.6129313
                   226.15525,6.2367376
                   214.7168,6.1113281 Z"
                fill="white"
              />

              {/* white left */}
              <path
                d="M 0,35.773438 V 58 H 65
                   L 64.97852,57
                   C 43.192081,57.127508
                   22.605139,49.707997
                   0,35.773438 Z"
                fill="white"
              />

              {/* purple wave */}
              <path
                d="m 0,16.7221 v 19.052
                   C 45.4067,63.7643
                   82.6667,65.4583
                   137.873,32.5286
                   193.08,-0.401184
                   219.54,3.87965
                   246,11.4535
                   V 6.51403
                   C 185.24,-16.8661
                   135.913,29.331
                   97.6933,40.8564
                   59.4733,52.3818
                   33.6467,44.1494
                   0,16.7221 Z"
                fill="#8F60DE"
              />
            </svg>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-6 pt-6 pb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.name}
            </h1>
            {user.job && (
              <p className="text-gray-500 text-sm">{user.job}</p>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {allLinks.map(([key, value]) => (
              <LinkItem
                key={key}
                platform={key}
                title={PLATFORM_TITLES[key] || key}
                value={String(value)}
              />
            ))}
          </div>

          <div className="text-center">
            <EditButton />
          </div>
        </div>
      </div>
    </main>
  );
}

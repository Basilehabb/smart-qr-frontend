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
        bg-gradient-to-r from-[#C9A441] to-[#B8962E]
        text-white font-medium
        shadow-md
        hover:scale-[1.02] transition
      "
    >
      <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-lg">
        {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
      </div>
      <span className="flex-1 text-left">{title}</span>
    </a>
  );
}

export default async function Page({ params }: Props) {
  const data = await fetchQr(params.code);

  if (!data.user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            هذا الـ QR غير مربوط
          </h2>
          <p className="text-gray-600 mb-6">
            يمكنك إنشاء حساب جديد أو تسجيل الدخول لربط هذا الـ QR.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`/register?code=${params.code}`}
              className="w-full px-4 py-3 rounded-lg bg-[#C9A441] text-white font-medium"
            >
              Create Account & Link QR
            </a>
            <LoginToLinkButton code={params.code} />
          </div>
        </div>
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
    <main className="min-h-screen bg-[#FAFAFA] flex justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="relative">

          {/* Cover Container - محصورة فوق الـ curve */}
          <div className="relative h-[300px] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-black" />

            {/* Cover */}
            {user.avatar && (
              <img
                src={user.avatar}
                alt="cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>

          {/* ORIGINAL CURVE (unchanged shape) */}
          <div className="absolute bottom-[-1px] left-0 w-full z-20">
            <svg
              viewBox="0 0 246 57"
              preserveAspectRatio="none"
              className="w-full h-[90px]"
            >
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
                fill="#000000"
              />
            </svg>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-6 pt-6 pb-8">

          {/* LOGO - أكبر وأوضح */}
          <div className="flex justify-center -mt-24 mb-6">
            <div className="
              w-40 h-40
              rounded-full
              bg-white
              shadow-xl
              ring-[6px] ring-[#C9A441]
              flex items-center justify-center
              p-2
            ">
              <img
                src="/loly-logo.png"
                alt="Loly Accessories"
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>

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

          <p className="text-xs text-gray-400 text-center mt-4">
            Powered by Loly Accessories
          </p>
        </div>
      </div>
    </main>
  );
}
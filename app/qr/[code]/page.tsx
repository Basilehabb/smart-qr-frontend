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
      <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-lg">
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
          <h2 className="text-xl font-semibold mb-2">هذا الـ QR غير مربوط</h2>
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

        {/* ================= HEADER WITH REAL MASK ================= */}
        <div className="relative h-[280px]">
          <svg
            viewBox="0 0 375 280"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <clipPath id="curveClip">
                <path
                  d="
                    M0,0
                    H375
                    V190
                    C300,230 75,230 0,190
                    Z
                  "
                />
              </clipPath>
            </defs>

            {user.avatar && (
              <image
                href={user.avatar}
                width="375"
                height="280"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#curveClip)"
              />
            )}

            <path
              d="M0,190 C75,230 300,230 375,190"
              fill="#111111"
            />
          </svg>
        </div>

        {/* ================= LOGO (كبير وواضح) ================= */}
        <div className="flex justify-center -mt-20 mb-4 relative z-30">
          <div className="w-36 h-36 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <img
              src="/loly-logo.png"
              alt="Loly Accessories"
              className="w-28 h-28 object-contain"
            />
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-6 pb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
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

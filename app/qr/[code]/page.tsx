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
        <div className="relative h-[300px] overflow-hidden">

          {/* Purple background */}
          <div className="absolute inset-0 bg-[#8F60DE]" />

          {/* Cover image */}
          {user.avatar && (
            <img
              src={user.avatar}
              alt="cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* White wave CUT */}
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-[120px]"
          >
            <path
              fill="#ffffff"
              d="
                M0,50
                C240,110 480,0 720,40
                960,80 1200,30 1440,60
                L1440,120
                L0,120
                Z
              "
            />
          </svg>
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

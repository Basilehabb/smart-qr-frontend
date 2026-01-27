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
  email: "Email",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <FaWhatsapp />,
  instagram: <FaInstagram />,
  facebook: <FaFacebook />,
  tiktok: <FaTiktok />,
  website: <FaGlobe />,
  phone: <FaPhoneAlt />,
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
      className="flex items-center gap-3 w-full px-6 py-3 rounded-full
      bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium
      shadow-md hover:shadow-lg transition"
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
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
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoginToLinkButton code={params.code} />
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
    <main className="min-h-screen bg-gray-50 flex justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* ===== HEADER ===== */}
        <div className="relative h-[300px] overflow-hidden">

          {/* Purple base */}
          <div className="absolute inset-0 bg-purple-600" />

          {/* Image */}
          <img
            src={user.avatar}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Wave */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%]">
            <svg
              viewBox="0 0 246 57"
              preserveAspectRatio="none"
              className="w-full h-[90px]"
            >
              {/* white */}
              <path
                d="M 214.7168,6.11 C 172,12 110,49 65,57 H 246 V 11 Z"
                fill="white"
              />
              <path
                d="M 0,36 V 58 H 65 C 40,57 20,49 0,36 Z"
                fill="white"
              />
              {/* purple */}
              <path
                d="M 0,17 V 36 C 45,64 83,65 138,33 193,-1 220,4 246,11 V 0 H 0 Z"
                fill="#8F60DE"
              />
            </svg>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="px-6 pt-6 pb-8 text-center">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          {user.job && <p className="text-gray-500 text-sm">{user.job}</p>}

          <div className="space-y-3 mt-6">
            {allLinks.map(([key, value]) => (
              <LinkItem
                key={key}
                platform={key}
                title={PLATFORM_TITLES[key] || key}
                value={String(value)}
              />
            ))}
          </div>

          <div className="mt-6">
            <EditButton />
          </div>
        </div>
      </div>
    </main>
  );
}

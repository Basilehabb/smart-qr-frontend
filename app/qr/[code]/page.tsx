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
  email: "Email",
};

/* ===== Platform icons ===== */
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
        flex items-center gap-3
        w-full px-6 py-3
        rounded-full
        bg-gradient-to-r from-purple-600 to-purple-700
        hover:from-purple-700 hover:to-purple-800
        text-white font-medium
        shadow-md hover:shadow-lg
        transition-all duration-200
      "
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0">
        {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
      </div>
      <span className="flex-1 text-left">{title}</span>
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

    const allLinks = Object.entries(profile).flatMap(([_, group]) =>
      Object.entries(group || {}).filter(
        ([_, v]) => v && String(v).trim() !== ""
      )
    );

    return (
      <main className="min-h-screen bg-gray-50 flex justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

          {/* ===== Header ===== */}
          <div className="relative">

            {/* Cover Image */}
            <div className="h-72 w-full overflow-hidden">
              <img
                src={user.avatar || "/cover-placeholder.jpg"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Purple overlay (keeps purple visible) */}
            <div className="absolute inset-0 bg-purple-600/25" />

            {/* ===== HiHello Exact Wave ===== */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
              <svg
                viewBox="0 0 246 57"
                preserveAspectRatio="xMinYMax meet"
                className="w-full h-[80px]"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* White right */}
                <path
                  d="M 214.7168,6.1113281
                     C 195.65271,5.9023124 172.37742,11.948182 137.87305,32.529297
                     110.16613,49.05604 86.980345,56.862784 65.015625,57
                     H 65 v 1 H 246 V 11.453125
                     C 236.0775,8.6129313 226.15525,6.2367376 214.7168,6.1113281 Z"
                  fill="white"
                />

                {/* White left */}
                <path
                  d="M 0,35.773438 V 58 H 65
                     L 64.97852,57
                     C 43.192081,57.127508 22.605139,49.707997 0,35.773438 Z"
                  fill="white"
                />

                {/* Purple wave */}
                <path
                  d="m 0,16.7221 v 19.052
                     C 45.4067,63.7643 82.6667,65.4583 137.873,32.5286
                     193.08,-0.401184 219.54,3.87965 246,11.4535
                     V 6.51403
                     C 185.24,-16.8661 135.913,29.331 97.6933,40.8564
                     59.4733,52.3818 33.6467,44.1494 0,16.7221 Z"
                  fill="#8F60DE"
                />
              </svg>
            </div>
          </div>

          {/* ===== Content ===== */}
          <div className="px-6 pt-6 pb-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {user.name}
              </h1>
              {user.job && (
                <p className="text-gray-600 text-sm">
                  {user.job}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
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

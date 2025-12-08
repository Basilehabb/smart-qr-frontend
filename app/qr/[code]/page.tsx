// app/qr/[code]/page.tsx
import EditButton from "./EditButton";
import LoginToLinkButton from "./LoginToLinkButton";

type Props = { params: { code: string } };

async function fetchQr(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${code}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("QR not found");
  return res.json();
}

const SECTIONS = [
  { key: "social", title: "Social" },
  { key: "contact", title: "Contact" },
  { key: "payment", title: "Payment" },
  { key: "video", title: "Videos" },
  { key: "music", title: "Music" },
  { key: "design", title: "Design" },
  { key: "gaming", title: "Gaming" },
  { key: "other", title: "Other" },
];

export default async function Page({ params }: Props) {
  const code = params.code;

  try {
    const data = await fetchQr(code);

    // ============= CASE 1 — QR NOT LINKED =============
    if (!data.user) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="p-8 bg-white rounded shadow max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-2">هذا الـ QR غير مربوط</h2>
            <p className="text-gray-600 mb-4">
              يمكنك تسجيل حساب جديد أو تسجيل دخول لربط هذا QR.
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <a
                href={`/register?code=${code}`}
                className="px-4 py-2 bg-blue-600 text-white rounded"
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

    // ============= CASE 2 — QR LINKED =============
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">

          {/* Avatar */}
          <div className="flex justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-4xl font-bold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Name & Job */}
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.job && (
              <p className="text-gray-500 text-sm">{user.job}</p>
            )}
            {(user.phone || user.countryCode) && (
              <p className="text-gray-600 text-sm mt-1">
                {user.countryCode} {user.phone}
              </p>
            )}
          </div>

          {/* Links Sections */}
          <div className="mt-6 space-y-5">
            {SECTIONS.map((sec) => {
              const entries = Object.entries(profile[sec.key] || {}).filter(
                ([, v]) => v !== null && v !== ""
              );

              if (!entries.length) return null;

              return (
                <div key={sec.key}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {sec.title}
                  </h3>

                  <div className="space-y-2">
                    {entries.map(([key, value]) => (
                      <a
                        key={key}
                        href={String(value)}
                        target="_blank"
                        className="flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          •
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">{key}</div>
                          <div className="text-gray-500 text-xs break-all">
                            {String(value)}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit button (only if logged in user owns the QR) */}
          <div className="mt-6">
            <EditButton />
          </div>
        </div>
      </main>
    );
  } catch (err) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow text-center">
          <h2 className="text-lg font-semibold">هذا الـ QR غير موجود</h2>
          <p className="text-gray-600">تأكد من الكود أو تواصل مع الدعم.</p>
        </div>
      </main>
    );
  }
}

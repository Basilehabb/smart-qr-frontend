export function normalizeLink(type: string, value: string) {
  if (!value) return "";

  const v = value.trim();
  const lowered = v.toLowerCase();
  const cleanHandle = v
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/^facebook\.com\//i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^tiktok\.com\/@?/i, "")
    .replace(/^youtube\.com\/@?/i, "")
    .replace(/^snapchat\.com\/add\//i, "")
    .replace(/\/+$/, "");

  const phoneDigits = v.replace(/[^\d+]/g, "");
  const normalizedPhone = phoneDigits.startsWith("+")
    ? phoneDigits
    : `+${phoneDigits.replace(/^0+/, "20")}`;

  if (
    lowered.startsWith("http://") ||
    lowered.startsWith("https://") ||
    lowered.startsWith("tel:") ||
    lowered.startsWith("mailto:")
  ) {
    if (type === "phone" && !lowered.startsWith("tel:")) {
      return `tel:${normalizedPhone}`;
    }
    if (type === "email" && !lowered.startsWith("mailto:")) {
      return `mailto:${v}`;
    }
    return v;
  }

  switch (type) {
    case "facebook":
      return `https://www.facebook.com/${cleanHandle}`;

    case "instagram":
      return `https://www.instagram.com/${cleanHandle}`;

    case "tiktok":
      return `https://www.tiktok.com/@${cleanHandle.replace(/^@/, "")}`;

    case "youtube":
      return `https://www.youtube.com/@${cleanHandle.replace(/^@/, "")}`;

    case "snapchat":
      return `https://www.snapchat.com/add/${cleanHandle}`;

    case "whatsapp":
      return `https://wa.me/${normalizedPhone.replace(/^\+/, "")}`;

    case "phone":
      return `tel:${normalizedPhone}`;

    case "email":
      return `mailto:${v}`;

    case "website":
      return /^https?:\/\//i.test(v) ? v : `https://${v}`;

    case "paypal":
      return /^https?:\/\//i.test(v) ? v : `https://paypal.me/${cleanHandle}`;

    default:
      return v;
  }
}
  

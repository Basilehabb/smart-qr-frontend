"use client";

import { useEffect, useState } from "react";
import { subscribeToUpgrade } from "@/lib/api";

const featureCopy: Record<string, { title: string; description: string }> = {
  canEditProfile: {
    title: "Profile editing is not included",
    description: "Your current plan does not allow profile edits.",
  },
  maxLinks: {
    title: "Link limit reached",
    description: "Your current plan has reached its maximum number of links.",
  },
  allowDuplicateType: {
    title: "Duplicate link types are not included",
    description: "Your current plan allows one link for each platform type.",
  },
  blockedSections: {
    title: "This section is not included",
    description: "Your current plan does not allow links in this section.",
  },
};

type UpgradeModalProps = {
  feature: string;
  onClose?: () => void;
};

export default function UpgradeModal({ feature, onClose }: UpgradeModalProps) {
  const [open, setOpen] = useState(true);
  const copy = featureCopy[feature] || {
    title: "Upgrade required",
    description: "Your current plan does not include this feature.",
  };

  if (!open) return null;

  function close() {
    setOpen(false);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Plan limit</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{copy.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{copy.description}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Contact an administrator to change your plan.</p>
        <div className="mt-6 flex justify-end">
          <button onClick={close} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function UpgradeModalHost() {
  const [feature, setFeature] = useState<string | null>(null);

  useEffect(() => subscribeToUpgrade(setFeature), []);

  return feature ? <UpgradeModal key={feature} feature={feature} onClose={() => setFeature(null)} /> : null;
}

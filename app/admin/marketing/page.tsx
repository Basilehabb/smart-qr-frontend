"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getAdminTokenOrRedirect, handleAdminAuthError } from "@/lib/adminSession";
import AdminSidebar from "../AdminSidebar";

type Plan = {
  id: string;
  name: string;
};

type Campaign = {
  id: string;
  message: string;
  created_at: string;
  total_users: number;
  success_count: number;
  failed_count: number;
  status: string;
};

type Filters = {
  planId: string;
  countryCode: string;
  createdFrom: string;
  createdTo: string;
};

const emptyFilters = (): Filters => ({
  planId: "",
  countryCode: "",
  createdFrom: "",
  createdTo: "",
});

const statusLabel = (status: string) => status.replaceAll("_", " ");

export default function AdminMarketingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [message, setMessage] = useState("");
  const [matchedUsers, setMatchedUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const getHeaders = () => {
    const token = getAdminTokenOrRedirect(router);
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  const requestFilters = () => ({
    ...(filters.planId ? { planId: filters.planId } : {}),
    ...(filters.countryCode.trim() ? { countryCode: filters.countryCode.trim() } : {}),
    ...(filters.createdFrom ? { createdFrom: filters.createdFrom } : {}),
    ...(filters.createdTo ? { createdTo: filters.createdTo } : {}),
  });

  async function loadHistory() {
    const headers = getHeaders();
    if (!headers) return;
    const response = await api.get("/admin/marketing/history", { headers });
    setCampaigns(response.data.campaigns || []);
  }

  useEffect(() => {
    const headers = getHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get("/admin/plans", { headers }),
      api.get("/admin/marketing/history", { headers }),
    ])
      .then(([plansResponse, historyResponse]) => {
        setPlans(plansResponse.data.plans || []);
        setCampaigns(historyResponse.data.campaigns || []);
      })
      .catch((requestError) => {
        if (!handleAdminAuthError(requestError, router)) {
          setError("Could not load WhatsApp Marketing.");
        }
      })
      .finally(() => setLoading(false));
    // The authenticated request is loaded once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function updateFilter(field: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
    setMatchedUsers(null);
    setNotice("");
  }

  async function previewRecipients() {
    const headers = getHeaders();
    if (!headers) return null;

    setPreviewing(true);
    setError("");
    setNotice("");
    try {
      const response = await api.post("/admin/marketing/preview", { filters: requestFilters() }, { headers });
      const count = Number(response.data.count || 0);
      setMatchedUsers(count);
      return count;
    } catch (requestError: any) {
      if (!handleAdminAuthError(requestError, router)) {
        setError(requestError?.response?.data?.message || "Could not preview recipients.");
      }
      return null;
    } finally {
      setPreviewing(false);
    }
  }

  async function sendCampaign() {
    if (!message.trim()) {
      setError("Write a message before sending.");
      return;
    }

    setError("");
    setNotice("");
    const count = matchedUsers === null ? await previewRecipients() : matchedUsers;
    if (count === null || count === 0) {
      if (count === 0) setError("No users with valid phone numbers match these filters.");
      return;
    }
    if (!window.confirm(`Send this WhatsApp campaign to ${count.toLocaleString()} matched users?`)) return;

    const headers = getHeaders();
    if (!headers) return;

    setSending(true);
    try {
      const response = await api.post(
        "/admin/marketing/send",
        { message: message.trim(), filters: requestFilters() },
        { headers }
      );
      const totalUsers = response.data?.campaign?.totalUsers ?? count;
      setMessage("");
      setMatchedUsers(null);
      setNotice(`Campaign queued for ${Number(totalUsers).toLocaleString()} users.`);
      await loadHistory();
    } catch (requestError: any) {
      if (!handleAdminAuthError(requestError, router)) {
        setError(requestError?.response?.data?.message || "Could not queue campaign.");
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="mt-20 text-center">Loading WhatsApp Marketing...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">WhatsApp Marketing</h1>
            <p className="mt-1 text-sm text-gray-500">Send approved WhatsApp campaigns only to registered users with valid phone numbers.</p>
          </div>

          {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {notice && <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}

          <section className="rounded-lg bg-white p-6 shadow">
            <div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recipients</h2>
                <p className="text-sm text-gray-500">Filters apply only to users already stored in the database.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilters(emptyFilters());
                  setMatchedUsers(null);
                  setNotice("");
                }}
                className="rounded border px-3 py-2 text-sm"
              >
                Clear filters
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-medium">
                Plan
                <select value={filters.planId} onChange={(event) => updateFilter("planId", event.target.value)} className="mt-1 w-full rounded border px-3 py-2 font-normal">
                  <option value="">All plans</option>
                  {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                </select>
              </label>

              <label className="text-sm font-medium">
                Country calling code
                <input value={filters.countryCode} onChange={(event) => updateFilter("countryCode", event.target.value)} className="mt-1 w-full rounded border px-3 py-2 font-normal" placeholder="e.g. +20" />
              </label>

              <label className="text-sm font-medium">
                Created from
                <input type="date" value={filters.createdFrom} onChange={(event) => updateFilter("createdFrom", event.target.value)} className="mt-1 w-full rounded border px-3 py-2 font-normal" />
              </label>

              <label className="text-sm font-medium">
                Created to
                <input type="date" value={filters.createdTo} onChange={(event) => updateFilter("createdTo", event.target.value)} className="mt-1 w-full rounded border px-3 py-2 font-normal" />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-4 rounded-lg bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Matched Users</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {matchedUsers === null ? "Preview required" : `${matchedUsers.toLocaleString()} Users`}
                </div>
              </div>
              <button type="button" onClick={previewRecipients} disabled={previewing} className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
                {previewing ? "Checking..." : "Preview recipients"}
              </button>
            </div>
          </section>

          <section className="rounded-lg bg-white p-6 shadow">
            <div>
              <h2 className="text-lg font-semibold">Message</h2>
              <p className="mt-1 text-sm text-gray-500">The text is inserted into the approved Meta marketing template configured for this environment.</p>
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1024}
              rows={6}
              className="mt-4 w-full rounded border px-3 py-2"
              placeholder="Write the message your customers should receive..."
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Use an approved, opt-in marketing audience only.</span>
              <span>{message.length}/1024</span>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={sendCampaign} disabled={sending || previewing} className="rounded bg-green-600 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
                {sending ? "Queueing..." : "Send campaign"}
              </button>
            </div>
          </section>

          <section className="overflow-x-auto rounded-lg bg-white shadow">
            <div className="border-b p-6">
              <h2 className="text-lg font-semibold">Campaign History</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="p-3">Date</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Total Users</th>
                  <th className="p-3">Success</th>
                  <th className="p-3">Failed</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b last:border-0">
                    <td className="p-3 whitespace-nowrap">{new Date(campaign.created_at).toLocaleString()}</td>
                    <td className="max-w-md p-3"><p className="line-clamp-2">{campaign.message}</p></td>
                    <td className="p-3">{campaign.total_users}</td>
                    <td className="p-3 text-green-700">{campaign.success_count}</td>
                    <td className="p-3 text-red-700">{campaign.failed_count}</td>
                    <td className="p-3"><span className="rounded bg-gray-100 px-2 py-1 text-xs capitalize">{statusLabel(campaign.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {campaigns.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No campaigns have been sent yet.</p>}
          </section>
        </div>
      </main>
    </div>
  );
}

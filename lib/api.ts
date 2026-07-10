import axios from "axios";

type UpgradeListener = (feature: string) => void;

const upgradeListeners = new Set<UpgradeListener>();

export function subscribeToUpgrade(listener: UpgradeListener) {
  upgradeListeners.add(listener);
  return () => {
    upgradeListeners.delete(listener);
  };
}

function openUpgradeModal(feature: string) {
  upgradeListeners.forEach((listener) => listener(feature));
}

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    if (typeof window !== "undefined" && data?.code === "UPGRADE_REQUIRED" && data?.feature) {
      openUpgradeModal(data.feature);
    }
    return Promise.reject(error);
  }
);

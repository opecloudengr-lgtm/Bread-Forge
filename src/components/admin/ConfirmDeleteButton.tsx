"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmDeleteButton({
  confirmMessage,
  deleteUrl,
  label = "Delete",
}: {
  confirmMessage: string;
  deleteUrl: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(deleteUrl, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error ?? "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "Deleting…" : label}
    </button>
  );
}

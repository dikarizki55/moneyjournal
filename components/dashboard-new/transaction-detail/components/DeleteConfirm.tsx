"use client";

import { useState } from "react";
import { IconCheckmark } from "@/components/dashboard-new/Icon";

interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirm({
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmProps) {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="mx-5 mt-5 rounded-[20px] bg-new-accent-red-background p-5">
      <p className="text-sm font-semibold text-new-accent-red">
        Delete this transaction?
      </p>
      <p className="text-xs text-new-accent-red/80 mt-1">
        It will be moved to the recycle bin.
      </p>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            setShow(false);
            onCancel();
          }}
          className="flex-1 rounded-full py-2.5 text-sm font-semibold bg-new-background text-new-muted-foreground"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setShow(false);
            onConfirm();
          }}
          disabled={isDeleting}
          className="flex-1 rounded-full py-2.5 text-sm font-semibold bg-new-accent-red text-new-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
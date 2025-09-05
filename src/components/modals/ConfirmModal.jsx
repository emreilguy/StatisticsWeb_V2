// src/components/modals/ConfirmModal.jsx
import React from "react";

export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, busy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-gradient-to-br from-slate-800 to-indigo-900 p-8 rounded-2xl shadow-2xl text-white max-w-md w-full glass-card border border-white/10">
        <h2 className="text-2xl font-semibold mb-4 text-red-400">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition disabled:opacity-50"
            disabled={!!busy}
            aria-busy={!!busy}
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// src/hooks/useDeleteCenter.js
import { useRef, useState } from "react";
import { UpdateTableItem } from "../constants/AwsUtils";

export default function useDeleteCenter({ onAfterDelete, showToast }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);
  const backupRef = useRef([]);

  function requestDelete(row, currentRows, setRows) {
    backupRef.current = currentRows;
    setPendingDeleteRow(row);
    setShowConfirmModal(true);
  }

  async function confirmDelete(setRows, refetch) {
    if (!pendingDeleteRow) return;
    setDeletingId(pendingDeleteRow.centerId);
    setRows((prev) =>
      prev.filter((r) => r.centerId !== pendingDeleteRow.centerId)
    );
    setShowConfirmModal(false);

    try {
      await UpdateTableItem(pendingDeleteRow.centerId);
      setPendingDeleteRow(null);
      setDeletingId(null);
      showToast("Center deleted successfully", "success");
      if (typeof refetch === "function") await refetch();
      if (onAfterDelete) onAfterDelete();
    } catch (e) {
      setRows(backupRef.current);
      setDeletingId(null);
      showToast("Delete failed. Please try again.", "error");
      console.error("Delete failed", e);
    }
  }

  function cancelDelete() {
    setShowConfirmModal(false);
    setPendingDeleteRow(null);
  }

  return {
    showConfirmModal,
    deletingId,
    requestDelete,
    confirmDelete,
    cancelDelete,
  };
}

"use client";

import { useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useCreateSyllabus } from "@/features/subjects/hooks/mutations/useCreateSyllabus";
import { useUiStore } from "@/store/ui.store";

export const ADD_SYLLABUS_MODAL = "add-syllabus";

export function AddSyllabusModal() {
  const createSyllabus = useCreateSyllabus();
  const closeModal = useUiStore((s) => s.closeModal);
  const showToast = useUiStore((s) => s.showToast);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    createSyllabus.mutate(
      { name: name.trim(), code: code.trim() || "NEW" },
      {
        onSuccess: () => {
          closeModal();
          setName("");
          setCode("");
          showToast({ type: "success", message: "Syllabus added" });
        },
      }
    );
  };

  return (
    <Modal id={ADD_SYLLABUS_MODAL} title="Add Syllabus">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Subject name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chemistry" autoFocus />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Code</label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CHM" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" loading={createSyllabus.isPending} disabled={!name.trim()} onClick={handleCreate}>
            Add Syllabus
          </Button>
        </div>
      </div>
    </Modal>
  );
}

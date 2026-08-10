"use client";

import { useState } from "react";
import { Button, ControlPill, Input, Modal } from "@/components/ui";
import { PlusIcon } from "@/components/icons";
import { SUBJECTS_META } from "@/features/subjects/constants/constants";
import { useCreateSyllabus } from "@/features/subjects/hooks/mutations/useCreateSyllabus";
import { useUiStore } from "@/store/ui.store";
import type { Role } from "@/store/session.store";

const ADD_SYLLABUS_MODAL = "add-syllabus";

export function SubjectsHeader({ initialRole }: { initialRole: Role }) {
  const meta = SUBJECTS_META[initialRole];
  const createSyllabus = useCreateSyllabus();
  const openModal = useUiStore((s) => s.openModal);
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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">{meta.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{meta.subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ControlPill label="Year" variant="outline" size="md" value="2026" onClick={() => {}} />
        <ControlPill label="Term" variant="outline" size="md" value="First" onClick={() => {}} />
        <Button
          variant="primary"
          className="h-12 rounded-full px-6 text-[15px]"
          onClick={() => openModal(ADD_SYLLABUS_MODAL)}
        >
          <PlusIcon size={18} /> Add Syllabus
        </Button>
      </div>

      <Modal id={ADD_SYLLABUS_MODAL} title="Add Syllabus">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Subject name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chemistry"
              autoFocus
            />
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
    </div>
  );
}

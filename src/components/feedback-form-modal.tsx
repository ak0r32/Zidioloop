"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { FormField, TextInput, TextArea, Select, Button } from "./form";

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackFormData) => Promise<void>;
  initialData?: FeedbackFormData;
  isLoading?: boolean;
}

export interface FeedbackFormData {
  content: string;
  channel: string;
  sentiment?: string;
  status?: string;
  customerLabel?: string;
}

export function FeedbackFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: FeedbackFormModalProps) {
  const [formData, setFormData] = useState<FeedbackFormData>(
    initialData || {
      content: "",
      channel: "email",
      sentiment: "NEU",
      status: "NEW",
    }
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.content.trim()) {
      setError("Feedback content is required");
      return;
    }

    if (!formData.channel.trim()) {
      setError("Channel is required");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        content: "",
        channel: "email",
        sentiment: "NEU",
        status: "NEW",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save feedback");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Feedback" : "Add New Feedback"}
      description="Capture and categorize customer feedback"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {initialData ? "Update" : "Create"} Feedback
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-300 border border-red-500/30">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </span>
          </div>
        )}

        <FormField label="Feedback Content" required>
          <TextArea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="What did the customer say?"
            rows={4}
            maxLength={500}
          />
          <div className="text-xs text-slate-500 mt-1">
            {formData.content.length}/500 characters
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Channel" required>
            <Select
              value={formData.channel}
              onChange={(e) =>
                setFormData({ ...formData, channel: e.target.value })
              }
            >
              <option value="email">📧 Email</option>
              <option value="chat">💬 Chat</option>
              <option value="phone">☎️ Phone</option>
              <option value="twitter">𝕏 Twitter</option>
              <option value="review">⭐ Review</option>
              <option value="survey">📋 Survey</option>
            </Select>
          </FormField>

          <FormField label="Customer Label">
            <TextInput
              value={formData.customerLabel || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customerLabel: e.target.value || undefined,
                })
              }
              placeholder="e.g., ACME Corp"
              icon="🏢"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sentiment">
            <Select
              value={formData.sentiment || "NEU"}
              onChange={(e) =>
                setFormData({ ...formData, sentiment: e.target.value })
              }
            >
              <option value="POS">Positive ✓</option>
              <option value="NEU">Neutral ◐</option>
              <option value="NEG">Negative ✗</option>
            </Select>
          </FormField>

          <FormField label="Status">
            <Select
              value={formData.status || "NEW"}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACTIONED">Actioned</option>
            </Select>
          </FormField>
        </div>
      </form>
    </Modal>
  );
}

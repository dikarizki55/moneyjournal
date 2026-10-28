"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TransactionItem } from "@/lib/dashboard-new-types";
import type { WizardData } from "@/components/dashboard-new/TransactionWizard";
import { emptyWizardData } from "../utils/emptyWizardData";
import { wizardDataFromTransaction } from "../utils/wizardDataFromTransaction";
import { validateField, type EditableField } from "../utils/validateField";

type Mode = "view" | "edit" | "field-editor";

export function useTransactionForm(transaction: TransactionItem | null) {
  const [mode, setMode] = useState<Mode>("view");
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [formData, setFormData] = useState<WizardData>(() =>
    transaction ? wizardDataFromTransaction(transaction) : emptyWizardData(),
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setFormData(wizardDataFromTransaction(transaction));
      setMode("view");
      setEditingField(null);
      setFieldError(null);
    }
  }, [transaction]);

  const setField = useCallback(
    <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      if (editingField && fieldError) {
        setFieldError(null);
      }
    },
    [editingField, fieldError],
  );

  const resetForm = useCallback(() => {
    if (transaction) {
      setFormData(wizardDataFromTransaction(transaction));
    } else {
      setFormData(emptyWizardData());
    }
    setFieldError(null);
  }, [transaction]);

  const openFieldEditor = useCallback((field: EditableField) => {
    setEditingField(field);
    setFieldError(null);
    setMode("field-editor");
  }, []);

  const closeFieldEditor = useCallback(() => {
    setEditingField(null);
    setFieldError(null);
    setMode("edit");
  }, []);

  const handleEditCancel = useCallback(() => {
    resetForm();
    setMode("view");
  }, [resetForm]);

  const validate = useCallback(
    (field: EditableField) => {
      const error = validateField(field, formData);
      if (error) {
        setFieldError(error);
        return false;
      }
      setFieldError(null);
      return true;
    },
    [formData],
  );

  return {
    mode,
    setMode,
    editingField,
    setEditingField,
    formData,
    setField,
    fieldError,
    setFieldError,
    openFieldEditor,
    closeFieldEditor,
    handleEditCancel,
    validate,
    resetForm,
  };
}
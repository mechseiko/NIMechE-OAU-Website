"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input, Select, Switch, Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Feedback";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL, createDoc, deleteDocAt, updateDocAt, type CollectionName } from "@/lib/db";
import { errorMessage, nowIso } from "@/lib/utils";

export interface SubField {
  key: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "switch" | "image" | "list" | "rows" | "datetime" | "number";
  options?: { value: string; label: string }[];
  subfields?: SubField[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  half?: boolean;
}

interface CrudManagerProps<T extends { id: string }> {
  title: string;
  description?: string;
  collection: CollectionName;
  fields: FieldDef[];
  columns: Column<T>[];
  defaults: Record<string, unknown>;
  prepare?: (values: Record<string, unknown>, existing: T | null) => Record<string, unknown>;
  sort?: (a: T, b: T) => number;
  emptyTitle: string;
  emptyMessage?: string;
  readOnly?: boolean;
  rowKey?: (row: T) => string;
  extraHeader?: ReactNode;
}

type Values = Record<string, unknown>;

export function CrudManager<T extends { id: string }>({
  title,
  description,
  collection,
  fields,
  columns,
  defaults,
  prepare,
  sort,
  emptyTitle,
  emptyMessage,
  readOnly,
  rowKey,
  extraHeader,
}: CrudManagerProps<T>) {
  const { data, loading } = useCollection<T>(collection);
  const { role } = useAuth();
  const { toast } = useToast();

  const isEditor = role === "editor";
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [values, setValues] = useState<Values>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);

  const rows = useMemo(() => (sort ? [...data].sort(sort) : data), [data, sort]);

  function openCreate() {
    setEditing(null);
    setValues({ ...defaults });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    const next: Values = { ...defaults };
    for (const field of fields) {
      const current = (row as Values)[field.name];
      next[field.name] = current === undefined ? defaults[field.name] : current;
    }
    setValues(next);
    setErrors({});
    setModalOpen(true);
  }

  function setField(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const field of fields) {
      if (!field.required) continue;
      const value = values[field.name];
      const empty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (empty) next[field.name] = `${field.label} is required`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payloadBase: Values = { ...values };
      if (isEditor) payloadBase.published = false;
      const payload = prepare ? prepare(payloadBase, editing) : payloadBase;
      if (editing) {
        await updateDocAt(collection, editing.id, payload);
        toast("Record updated.");
      } else {
        await createDoc(collection, { ...payload, createdAt: nowIso() } as never);
        toast("Record created.");
      }
      setModalOpen(false);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteDocAt(collection, deleting.id);
      toast("Record deleted.");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {extraHeader}
          {!readOnly && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden /> Add new
            </Button>
          )}
        </div>
      </header>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
        onEdit={readOnly || isEditor ? undefined : openEdit}
        onDelete={readOnly || isEditor ? undefined : (row) => setDeleting(row)}
        rowKey={rowKey ?? ((row) => row.id)}
      />
      {isEditor && !readOnly && (
        <p className="rounded-lg bg-accent-soft px-4 py-2 text-xs font-semibold text-accent-dark">
          Editor role: you can create drafts but only Administrators publish, edit or delete records.
        </p>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${title.toLowerCase()}` : `New ${title.toLowerCase()}`}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              onChange={(value) => setField(field.name, value)}
              folder={collection}
            />
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete record"
        message="This permanently removes the record from the website. This action cannot be undone."
        loading={false}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  error,
  onChange,
  folder,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  folder: string;
}) {
  const spanClass = field.type === "textarea" || field.type === "image" || field.type === "rows" ? "sm:col-span-2" : field.half ? "" : "sm:col-span-2";

  switch (field.type) {
    case "textarea":
      return (
        <div className={spanClass}>
          <Textarea
            label={field.label}
            required={field.required}
            rows={5}
            value={(value as string) ?? ""}
            onChange={(event) => onChange(event.target.value)}
            error={error}
            hint={field.hint}
            placeholder={field.placeholder}
          />
        </div>
      );
    case "select":
      return (
        <div className={spanClass}>
          <Select
            label={field.label}
            required={field.required}
            options={field.options ?? []}
            value={(value as string) ?? ""}
            onChange={(event) => onChange(event.target.value)}
            error={error}
            hint={field.hint}
            placeholder="Select…"
          />
        </div>
      );
    case "switch":
      return (
        <div className={`${spanClass} flex items-end pb-2`}>
          <Switch
            id={`field-${field.name}`}
            label={field.label}
            description={field.hint}
            checked={Boolean(value)}
            onChange={onChange}
          />
        </div>
      );
    case "image":
      return (
        <div className={spanClass}>
          <ImageUpload
            label={field.label}
            folder={folder}
            value={(value as string) ?? ""}
            onChange={(url) => onChange(url)}
            required={field.required}
          />
          {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
        </div>
      );
    case "number":
      return (
        <div className={spanClass}>
          <Input
            label={field.label}
            type="number"
            required={field.required}
            value={String(value ?? 0)}
            onChange={(event) => onChange(Number(event.target.value))}
            error={error}
            hint={field.hint}
          />
        </div>
      );
    case "datetime":
      return (
        <div className={spanClass}>
          <Input
            label={field.label}
            type="datetime-local"
            required={field.required}
            value={toLocalInput(value as string | undefined)}
            onChange={(event) => onChange(event.target.value ? new Date(event.target.value).toISOString() : "")}
            error={error}
            hint={field.hint}
          />
        </div>
      );
    case "list":
      return (
        <div className={spanClass}>
          <ListEditor label={field.label} values={(value as string[]) ?? []} onChange={onChange} hint={field.hint} />
        </div>
      );
    case "rows":
      return (
        <div className={spanClass}>
          <RowsEditor label={field.label} subfields={field.subfields ?? []} values={(value as Values[]) ?? []} onChange={onChange} />
        </div>
      );
    default:
      return (
        <div className={spanClass}>
          <Input
            label={field.label}
            required={field.required}
            value={(value as string) ?? ""}
            onChange={(event) => onChange(event.target.value)}
            error={error}
            hint={field.hint}
            placeholder={field.placeholder}
          />
        </div>
      );
  }
}

function ListEditor({
  label,
  values,
  onChange,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-ink">{label}</legend>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
      {values.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            aria-label={`${label} item ${index + 1}`}
            value={item}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <IconButton label={`Remove ${label} item`} variant="outline" onClick={() => onChange(values.filter((_, i) => i !== index))}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      ))}
      <Button variant="outline" size="sm" className="self-start" onClick={() => onChange([...values, ""])}>
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add item
      </Button>
    </fieldset>
  );
}

function RowsEditor({
  label,
  subfields,
  values,
  onChange,
}: {
  label: string;
  subfields: SubField[];
  values: Values[];
  onChange: (values: Values[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-ink">{label}</legend>
      {values.map((row, index) => (
        <div key={index} className="rounded-xl border border-line bg-surface-subtle p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Item {index + 1}</span>
            <IconButton label={`Remove item ${index + 1}`} variant="outline" className="h-7 w-7" onClick={() => onChange(values.filter((_, i) => i !== index))}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {subfields.map((sub) => (
              <Input
                key={sub.key}
                label={sub.label}
                value={(row[sub.key] as string) ?? ""}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = { ...next[index], [sub.key]: event.target.value };
                  onChange(next);
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...values, Object.fromEntries(subfields.map((sub) => [sub.key, ""]))])}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add row
      </Button>
    </fieldset>
  );
}

function toLocalInput(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PublishedBadge(published: boolean) {
  return published ? <Badge tone="success">Published</Badge> : <Badge tone="neutral">Draft</Badge>;
}

export { COL };

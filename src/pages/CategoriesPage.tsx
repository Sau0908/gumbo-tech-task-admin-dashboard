import { Edit3, FolderOpen, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FieldError,
  LoadingState,
  Modal,
  PageHeader,
  SearchField,
  Toast,
} from "../components/UI";
import { useRequest } from "../hooks/useRequest";
import { categoryService } from "../services/categoryService";
import type { Category, CategoryPayload } from "../types";

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category?: Category;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    if (name.trim().length > 100) {
      setError("Keep the name under 100 characters.");
      return;
    }
    setBusy(true);
    setRequestError("");
    const payload: CategoryPayload = {
      name: name.trim(),
      description: description.trim(),
    };
    try {
      if (category) await categoryService.update(category._id, payload);
      else await categoryService.create(payload);
      onSaved(category ? "Category updated." : "Category created.");
    } catch (cause) {
      setRequestError(
        cause instanceof Error ? cause.message : "Unable to save category.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={category ? "Edit category" : "Create category"}
      description="Use categories to keep your catalogue easy to navigate."
      onClose={onClose}
    >
      <form className="entity-form" onSubmit={submit}>
        {requestError && <div className="form-alert wide">{requestError}</div>}
        <label className="wide">
          <span>Category name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Home & Living"
            autoFocus
          />
          <FieldError>{error}</FieldError>
        </label>
        <label className="wide">
          <span>
            Description <small>optional</small>
          </span>
          <textarea
            rows={4}
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What belongs in this category?"
          />
        </label>
        <div className="modal-actions wide">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={busy}>
            {busy && <LoaderCircle className="spin" />}
            {category ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null | "new">(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [toast, setToast] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const query = useRequest(categoryService.list);
  const filtered = (query.data ?? []).filter((c) =>
    `${c.name} ${c.description ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await categoryService.remove(deleting._id);
      setDeleting(null);
      setToast("Category deleted.");
      await query.reload();
    } catch (cause) {
      setDeleteError(
        cause instanceof Error ? cause.message : "Unable to delete category.",
      );
    } finally {
      setDeleteBusy(false);
    }
  };
  const saved = (message: string) => {
    setEditing(null);
    setToast(message);
    void query.reload();
  };
  return (
    <>
      <PageHeader
        eyebrow="Organization"
        title="Categories"
        description="Create clear groupings that make products easier to discover."
        action={
          <button className="btn primary" onClick={() => setEditing("new")}>
            <Plus /> New category
          </button>
        }
      />
      <div className="toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search categories…"
        />
        <span className="result-count">{filtered.length} categories</span>
      </div>
      {query.isLoading ? (
        <LoadingState label="Loading categories…" />
      ) : query.error ? (
        <ErrorState message={query.error.message} retry={query.reload} />
      ) : !filtered.length ? (
        <EmptyState
          title="No categories found"
          text={
            search
              ? "Try a different search."
              : "Create your first category to organize products."
          }
        />
      ) : (
        <section className="category-grid">
          {filtered.map((category) => (
            <article className="category-card" key={category._id}>
              <div className="category-card-top">
                <span>
                  <FolderOpen />
                </span>
                <div className="row-actions">
                  <button
                    className="icon-btn"
                    onClick={() => setEditing(category)}
                  >
                    <Edit3 />
                  </button>
                  <button
                    className="icon-btn danger-icon"
                    onClick={() => setDeleting(category)}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
              <h3>{category.name}</h3>
              <p>{category.description || "No description provided."}</p>
            </article>
          ))}
        </section>
      )}
      {editing && (
        <CategoryForm
          category={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}{" "}
      {deleting && (
        <ConfirmDialog
          title="Delete category?"
          text={`“${deleting.name}” can only be deleted if no products use it.`}
          busy={deleteBusy}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}{" "}
      {deleteError && (
        <Toast
          type="error"
          message={deleteError}
          onClose={() => setDeleteError("")}
        />
      )}{" "}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
}

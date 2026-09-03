import {
  Boxes,
  Edit3,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FieldError,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
  SearchField,
  Toast,
} from "../components/UI";
import { useRequest } from "../hooks/useRequest";
import { currency } from "../lib/utils";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";
import type { Category, Product, ProductPayload } from "../types";

const blank: ProductPayload = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  images: [],
};

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product?: Product;
  categories: Category[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const initial = product
    ? {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category:
          typeof product.category === "string"
            ? product.category
            : product.category._id,
        images: product.images,
      }
    : blank;
  const [form, setForm] = useState<ProductPayload>(initial);
  const [imageText, setImageText] = useState(initial.images.join("\n"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState("");
  const set = (key: keyof ProductPayload, value: string | number | string[]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Product name is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (form.price < 0 || Number.isNaN(form.price))
      next.price = "Enter a valid non-negative price.";
    if (form.stock < 0 || !Number.isInteger(form.stock))
      next.stock = "Stock must be a whole number.";
    if (!form.category) next.category = "Choose a category.";
    const images = imageText
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    if (
      images.some((url) => {
        try {
          new URL(url);
          return false;
        } catch {
          return true;
        }
      })
    )
      next.images = "Every image must be a valid URL.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setRequestError("");
    try {
      if (product)
        await productService.update(product._id, { ...form, images });
      else await productService.create({ ...form, images });
      onSaved(
        product
          ? "Product updated successfully."
          : "Product added successfully.",
      );
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Unable to save product.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={product ? "Edit product" : "Add new product"}
      description="Keep product information clear and inventory accurate."
      onClose={onClose}
    >
      <form className="entity-form" onSubmit={submit}>
        {requestError && <div className="form-alert wide">{requestError}</div>}
        <label className="wide">
          <span>Product name</span>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Organic cotton shirt"
          />
          <FieldError>{errors.name}</FieldError>
        </label>
        <label className="wide">
          <span>Description</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the product and its key features"
          />
          <FieldError>{errors.description}</FieldError>
        </label>
        <label>
          <span>Price (₹)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
          <FieldError>{errors.price}</FieldError>
        </label>
        <label>
          <span>Stock</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => set("stock", Number(e.target.value))}
          />
          <FieldError>{errors.stock}</FieldError>
        </label>
        <label className="wide">
          <span>Category</span>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError>{errors.category}</FieldError>
        </label>
        <label className="wide">
          <span>
            Image URLs <small>one per line</small>
          </span>
          <textarea
            rows={3}
            value={imageText}
            onChange={(e) => setImageText(e.target.value)}
            placeholder="https://example.com/product.jpg"
          />
          <FieldError>{errors.images}</FieldError>
        </label>
        <div className="modal-actions wide">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={busy}>
            {busy && <LoaderCircle className="spin" />}
            {product ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);
  const products = useRequest(
    () => productService.list(page, debounced),
    [page, debounced],
  );
  const categories = useRequest(categoryService.list);
  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await productService.remove(deleting._id);
      setDeleting(null);
      setToast("Product deleted.");
      await products.reload();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete product.",
      );
    } finally {
      setDeleteBusy(false);
    }
  };
  const saved = (message: string) => {
    setEditing(null);
    setToast(message);
    void products.reload();
  };
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Manage your product catalogue, pricing, and inventory."
        action={
          <button className="btn primary" onClick={() => setEditing("new")}>
            <Plus /> Add product
          </button>
        }
      />
      <div className="toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search products…"
        />
        <span className="result-count">
          {products.data?.pagination.total ?? 0} products
        </span>
      </div>
      <section className="panel data-panel">
        {products.isLoading ? (
          <LoadingState label="Loading products…" />
        ) : products.error ? (
          <ErrorState
            message={products.error.message}
            retry={products.reload}
          />
        ) : !products.data!.products.length ? (
          <EmptyState
            title="No products found"
            text={
              search
                ? "Try a different search term."
                : "Add your first product to get started."
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Inventory</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {products.data!.products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="product-cell">
                          <span className="product-thumb">
                            {product.images[0] ? (
                              <img src={product.images[0]} alt="" />
                            ) : (
                              <ImageIcon />
                            )}
                          </span>
                          <div>
                            <strong>{product.name}</strong>
                            <small>{product.description}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-chip">
                          {typeof product.category === "string"
                            ? "Uncategorized"
                            : product.category.name}
                        </span>
                      </td>
                      <td>
                        <strong>{currency.format(product.price)}</strong>
                      </td>
                      <td>
                        <div className="stock-cell">
                          <strong>{product.stock}</strong>
                          <span
                            className={`stock-dot ${product.stock === 0 ? "out" : product.stock < 10 ? "low" : ""}`}
                          />
                          <small>
                            {product.stock === 0
                              ? "Out of stock"
                              : product.stock < 10
                                ? "Low stock"
                                : "In stock"}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-btn"
                            onClick={() => setEditing(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit3 />
                          </button>
                          <button
                            className="icon-btn danger-icon"
                            onClick={() => setDeleting(product)}
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...products.data!.pagination} onPage={setPage} />
          </>
        )}
      </section>
      {editing && (
        <ProductForm
          product={editing === "new" ? undefined : editing}
          categories={categories.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}{" "}
      {deleting && (
        <ConfirmDialog
          title="Delete product?"
          text={`“${deleting.name}” will be permanently removed from your catalogue.`}
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

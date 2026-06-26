"use client";

import { useState } from "react";
import type { Category, Product } from "@itech/db";
import { Button } from "@itech/ui";
import { createClient } from "@/lib/supabase/client";

type Props = {
  categories: Category[];
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
};

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";

export function ProductForm({ categories, action, product }: Props) {
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "bin";
      const path = `products/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("catalog")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("catalog").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo subir la imagen",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="grid max-w-3xl gap-5">
      <input type="hidden" name="image_url" value={imageUrl} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label}>Nombre *</label>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className={field}
            placeholder="Ej. Laptop Lenovo IdeaPad 5"
          />
        </div>

        <div>
          <label className={label}>Slug (URL)</label>
          <input
            name="slug"
            defaultValue={product?.slug}
            className={field}
            placeholder="se genera del nombre si lo dejas vacío"
          />
        </div>
        <div>
          <label className={label}>SKU</label>
          <input name="sku" defaultValue={product?.sku ?? ""} className={field} />
        </div>

        <div>
          <label className={label}>Marca</label>
          <input
            name="brand"
            defaultValue={product?.brand ?? ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>Categoría</label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className={field}
          >
            <option value="">— Sin categoría —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Precio (S/) *</label>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={product?.price ?? ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>Precio anterior (S/)</label>
          <input
            name="compare_at_price"
            type="number"
            step="0.01"
            defaultValue={product?.compare_at_price ?? ""}
            className={field}
            placeholder="opcional (para mostrar descuento)"
          />
        </div>

        <div>
          <label className={label}>Stock</label>
          <input
            name="stock"
            type="number"
            defaultValue={product?.stock ?? 0}
            className={field}
          />
        </div>
      </div>

      <div>
        <label className={label}>Descripción</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className={field}
        />
      </div>

      <div>
        <label className={label}>Imagen</label>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-surface-subtle">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="preview"
                className="max-h-24 w-auto object-contain"
              />
            ) : (
              <span className="text-xs text-ink-muted">Sin imagen</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={uploading}
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-600 hover:file:bg-brand-100"
            />
            <input
              name="image_url_text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={`${field} mt-2`}
              placeholder="o pega una URL de imagen"
            />
            {uploading && (
              <p className="mt-1 text-xs text-brand-600">Subiendo imagen…</p>
            )}
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={product ? product.is_active : true}
          />
          Activo (visible en la tienda)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={product?.is_featured ?? false}
          />
          Destacado
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={uploading}>
          {product ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { deleteCategory } from "@/app/categorias/actions";

export function DeleteCategoryButton({ id }: { id: string }) {
  return (
    <form
      action={deleteCategory.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar esta categoría? Los productos quedarán sin categoría."))
          e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
      >
        Eliminar
      </button>
    </form>
  );
}

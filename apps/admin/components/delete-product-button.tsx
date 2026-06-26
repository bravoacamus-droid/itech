"use client";

import { deleteProduct } from "@/app/catalogo/actions";

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <form
      action={deleteProduct.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer."))
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

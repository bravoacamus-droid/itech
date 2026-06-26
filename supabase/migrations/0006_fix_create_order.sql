-- ============================================================
-- iTech Platform — Migración 0006: corrige create_order
-- "column reference id is ambiguous": el OUT param chocaba con
-- columnas. Se renombra el retorno y se cualifican las columnas.
-- ============================================================

drop function if exists public.create_order(jsonb, jsonb);

create or replace function public.create_order(p_customer jsonb, p_items jsonb)
returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_num text;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
  v_subtotal numeric(10, 2) := 0;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  v_num := 'ITC-' || lpad(nextval('public.order_seq')::text, 6, '0');

  insert into public.orders (
    order_number, user_id, customer_name, customer_phone,
    customer_email, address, payment_method
  ) values (
    v_num, auth.uid(),
    coalesce(p_customer ->> 'name', ''),
    coalesce(p_customer ->> 'phone', ''),
    nullif(p_customer ->> 'email', ''),
    nullif(p_customer ->> 'address', ''),
    coalesce(p_customer ->> 'payment_method', 'whatsapp')
  ) returning orders.id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product
      from public.products
      where products.id = (v_item ->> 'product_id')::uuid and products.is_active = true;
    if not found then
      raise exception 'Producto no disponible';
    end if;

    v_qty := greatest(1, coalesce((v_item ->> 'quantity')::int, 1));
    if v_product.stock < v_qty then
      raise exception 'Stock insuficiente para %', v_product.name;
    end if;

    insert into public.order_items (order_id, product_id, name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_product.price * v_qty);

    update public.products set stock = public.products.stock - v_qty
      where public.products.id = v_product.id;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal
    where public.orders.id = v_order_id;

  return query select v_order_id, v_num;
end;
$$;

grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;

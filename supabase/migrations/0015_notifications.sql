-- ============================================================
-- iTech Platform — Migración 0015: notificaciones automáticas
-- Triggers que generan notificaciones (WhatsApp/email) al cambiar el estado
-- de una reparación o al haber actividad de soporte. El envío real lo hace
-- un despachador (email vía Resend; WhatsApp vía enlace 1-clic o Twilio).
-- ============================================================

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  channel      text not null,                 -- whatsapp | email
  recipient    text not null,
  subject      text,
  body         text not null,
  status       text not null default 'pendiente', -- pendiente | enviado | error | descartado
  error        text,
  related_type text,                          -- repair | support
  related_id   uuid,
  created_at   timestamptz not null default now(),
  sent_at      timestamptz
);

create index if not exists idx_notifications_status on public.notifications (status, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_staff_all on public.notifications;
create policy notifications_staff_all on public.notifications
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update on public.notifications to authenticated;

-- Etiqueta de estado de reparación
create or replace function public.repair_status_label(p text)
returns text language sql immutable as $$
  select case p
    when 'recibido' then 'Recibido'
    when 'diagnostico' then 'En diagnóstico'
    when 'esperando_repuesto' then 'Esperando repuesto'
    when 'en_reparacion' then 'En reparación'
    when 'listo' then 'Listo para retirar'
    when 'entregado' then 'Entregado'
    when 'anulado' then 'Anulado'
    else p end;
$$;

-- Trigger: notificar al cliente cuando cambia el estado de su reparación
create or replace function public.notify_repair_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  t public.repair_tickets%rowtype;
  msg text;
begin
  select * into t from repair_tickets where id = new.ticket_id;
  if not found then return new; end if;

  msg := 'Hola ' || coalesce(t.customer_name, '') || ', tu reparación ' || t.ticket_number ||
         ' ahora está: ' || public.repair_status_label(new.status) ||
         coalesce('. Nota: ' || nullif(new.note, ''), '') ||
         '. Síguela en https://itech-web-woad.vercel.app/seguimiento';

  if coalesce(t.customer_phone, '') <> '' and t.customer_phone <> '-' then
    insert into notifications (channel, recipient, body, related_type, related_id)
    values ('whatsapp', t.customer_phone, msg, 'repair', t.id);
  end if;
  if coalesce(t.customer_email, '') <> '' then
    insert into notifications (channel, recipient, subject, body, related_type, related_id)
    values ('email', t.customer_email, 'Actualización de tu reparación ' || t.ticket_number, msg, 'repair', t.id);
  end if;
  return new;
end; $$;

drop trigger if exists trg_notify_repair on public.repair_updates;
create trigger trg_notify_repair
  after insert on public.repair_updates
  for each row execute function public.notify_repair_update();

-- Trigger: notificar a la empresa cuando soporte responde
create or replace function public.notify_support_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  t public.support_tickets%rowtype;
  co public.companies%rowtype;
  msg text;
begin
  if new.author_type <> 'soporte' then return new; end if;
  select * into t from support_tickets where id = new.ticket_id;
  if not found then return new; end if;
  select * into co from companies where id = t.company_id;

  msg := 'Tienes una respuesta en tu ticket de soporte ' || t.ticket_number ||
         ' ("' || t.subject || '"). Ingresa al portal: https://itech-web-woad.vercel.app/portal';

  if co.contact_phone is not null and co.contact_phone <> '' then
    insert into notifications (channel, recipient, body, related_type, related_id)
    values ('whatsapp', co.contact_phone, msg, 'support', t.id);
  end if;
  if co.contact_email is not null and co.contact_email <> '' then
    insert into notifications (channel, recipient, subject, body, related_type, related_id)
    values ('email', co.contact_email, 'Respuesta en tu ticket ' || t.ticket_number, msg, 'support', t.id);
  end if;
  return new;
end; $$;

drop trigger if exists trg_notify_support_msg on public.support_messages;
create trigger trg_notify_support_msg
  after insert on public.support_messages
  for each row execute function public.notify_support_message();

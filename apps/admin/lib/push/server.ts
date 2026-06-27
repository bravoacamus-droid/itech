import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
};

let configured = false;

/** Configura VAPID. .trim() evita el bug de "espacios en blanco" al pegar en Vercel. */
export function configurePush() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  const subj = process.env.VAPID_SUBJECT?.trim() || "mailto:admin@itech.pe";
  if (!pub || !priv) throw new Error("VAPID keys no configuradas");
  webpush.setVapidDetails(subj, pub, priv);
  configured = true;
}

export function vapidStatus() {
  return {
    public: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim(),
    private: !!process.env.VAPID_PRIVATE_KEY?.trim(),
    subject: !!process.env.VAPID_SUBJECT?.trim(),
    serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/**
 * Envía push a TODAS las suscripciones de un usuario. Lee con admin client
 * (bypass RLS), marca last_used_at al éxito y elimina suscripciones 404/410
 * (FCM las caduca). Devuelve cuántas se enviaron.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number }> {
  configurePush();
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);
  const list = (subs ?? []) as unknown as { id: string; endpoint: string; p256dh: string; auth: string }[];
  if (!list.length) return { sent: 0 };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/",
    tag: payload.tag,
    icon: payload.icon ?? "/icons/icon-192.png",
  });

  let sent = 0;
  await Promise.all(
    list.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
        );
        await admin.from("push_subscriptions").update({ last_used_at: new Date().toISOString() } as never).eq("id", s.id);
        sent++;
      } catch (err) {
        const e = err as { statusCode?: number };
        if (e.statusCode === 404 || e.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    }),
  );
  return { sent };
}

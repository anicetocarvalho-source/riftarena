import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, title, message, type, notification_id, data } =
      await req.json();

    if (!user_id || !title) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[push] Processing push for user=${user_id}, type=${type}, title=${title}`
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get VAPID keys
    const { data: vapidData, error: vapidError } = await supabaseAdmin
      .from("vapid_keys")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (vapidError || !vapidData) {
      console.log("[push] No VAPID keys configured, skipping");
      return new Response(
        JSON.stringify({ message: "No VAPID keys configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (subError || !subscriptions || subscriptions.length === 0) {
      console.log("[push] No push subscriptions for user, skipping");
      return new Response(
        JSON.stringify({ message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[push] Found ${subscriptions.length} subscription(s) for user`
    );

    // Configure web-push with VAPID credentials
    webpush.setVapidDetails(
      "mailto:push@riftarena.com",
      vapidData.public_key,
      vapidData.private_key
    );

    const payload = JSON.stringify({
      title,
      message,
      type,
      notification_id,
      data: data || {},
    });

    // Send to all subscriptions in parallel
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: Record<string, string>) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
          console.log(`[push] Sent to subscription ${sub.id}`);
        } catch (error: unknown) {
          const pushError = error as { statusCode?: number; message?: string };
          console.error(
            `[push] Failed for subscription ${sub.id}:`,
            pushError?.statusCode,
            pushError?.message
          );
          // Remove expired/invalid subscriptions (410 Gone or 404 Not Found)
          if (
            pushError?.statusCode === 410 ||
            pushError?.statusCode === 404
          ) {
            console.log(`[push] Removing expired subscription ${sub.id}`);
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
          throw error;
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled"
    ).length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`[push] Results: ${successful} sent, ${failed} failed`);

    return new Response(JSON.stringify({ sent: successful, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[push] Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

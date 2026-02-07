import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to access vapid_keys table (RLS blocks all client access)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if VAPID keys already exist
    const { data: existingKeys } = await supabaseAdmin
      .from("vapid_keys")
      .select("public_key")
      .limit(1)
      .maybeSingle();

    if (existingKeys) {
      console.log("Returning existing VAPID public key");
      return new Response(
        JSON.stringify({ publicKey: existingKeys.public_key }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new VAPID keys using Web Crypto API
    console.log("Generating new VAPID key pair...");
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign"]
    );

    const publicKeyRaw = await crypto.subtle.exportKey(
      "raw",
      keyPair.publicKey
    );
    const privateKeyJwk = await crypto.subtle.exportKey(
      "jwk",
      keyPair.privateKey
    );

    const publicKeyBase64 = arrayBufferToBase64Url(publicKeyRaw);
    const privateKeyBase64 = privateKeyJwk.d!;

    // Store keys in database
    const { error: insertError } = await supabaseAdmin
      .from("vapid_keys")
      .insert({
        public_key: publicKeyBase64,
        private_key: privateKeyBase64,
      });

    if (insertError) {
      console.error("Error storing VAPID keys:", insertError);
      throw new Error("Failed to store VAPID keys");
    }

    console.log("VAPID keys generated and stored successfully");
    return new Response(JSON.stringify({ publicKey: publicKeyBase64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Setup push error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

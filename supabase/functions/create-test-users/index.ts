import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestUserRequest {
  count?: number;
  gameId?: string;
}

const testUsers = [
  { email: "testplayer1@riftarena.test", username: "ProGamer_ZA", country: "South Africa" },
  { email: "testplayer2@riftarena.test", username: "StarKicker_NG", country: "Nigeria" },
  { email: "testplayer3@riftarena.test", username: "TurboPlayer_KE", country: "Kenya" },
  { email: "testplayer4@riftarena.test", username: "EliteGamer_GH", country: "Ghana" },
];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body: TestUserRequest = await req.json().catch(() => ({}));
    const count = Math.min(body.count || 2, 4);
    const createdUsers: Array<{ id: string; username: string; email: string }> = [];

    // Create test users
    for (let i = 0; i < count; i++) {
      const user = testUsers[i];
      
      // Check if user already exists
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, username")
        .eq("username", user.username)
        .maybeSingle();

      if (existingProfile) {
        createdUsers.push({
          id: existingProfile.id,
          username: existingProfile.username,
          email: user.email,
        });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: "TestPlayer123!",
        email_confirm: true,
        user_metadata: {
          username: user.username,
          country: user.country,
        },
      });

      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError);
        // Check if user exists but profile doesn't
        const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingAuth.users.find((u) => u.email === user.email);
        if (existingUser) {
          createdUsers.push({
            id: existingUser.id,
            username: user.username,
            email: user.email,
          });
        }
        continue;
      }

      if (authData.user) {
        createdUsers.push({
          id: authData.user.id,
          username: user.username,
          email: user.email,
        });
      }
    }

    // If gameId provided, create player rankings for created users
    if (body.gameId && createdUsers.length > 0) {
      for (const user of createdUsers) {
        // Use the get_or_create_ranking function
        await supabaseAdmin.rpc("get_or_create_ranking", {
          _user_id: user.id,
          _game_id: body.gameId,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${createdUsers.length} test users`,
        users: createdUsers,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create-test-users:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

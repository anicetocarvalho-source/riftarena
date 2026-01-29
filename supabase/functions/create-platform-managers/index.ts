import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ManagerAccount {
  email: string;
  username: string;
  country: string;
  role: "admin" | "organizer" | "sponsor";
}

const platformManagers: ManagerAccount[] = [
  {
    email: "admin@riftarena.com",
    username: "RiftAdmin",
    country: "South Africa",
    role: "admin",
  },
  {
    email: "organizer@riftarena.com",
    username: "RiftOrganizer",
    country: "Nigeria",
    role: "organizer",
  },
  {
    email: "sponsor@riftarena.com",
    username: "RiftSponsor",
    country: "Kenya",
    role: "sponsor",
  },
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

    const createdManagers: Array<{
      id: string;
      username: string;
      email: string;
      role: string;
    }> = [];
    const errors: Array<{ email: string; error: string }> = [];

    for (const manager of platformManagers) {
      console.log(`Processing manager: ${manager.email} with role: ${manager.role}`);

      // Check if user already exists by username
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, username")
        .eq("username", manager.username)
        .maybeSingle();

      if (existingProfile) {
        console.log(`User ${manager.username} already exists, checking role...`);
        
        // Check if role already assigned
        const { data: existingRole } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", existingProfile.id)
          .eq("role", manager.role)
          .maybeSingle();

        if (!existingRole) {
          // Add the role
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: existingProfile.id, role: manager.role });

          if (roleError) {
            console.error(`Error adding role for ${manager.email}:`, roleError);
            errors.push({ email: manager.email, error: roleError.message });
          } else {
            console.log(`Added ${manager.role} role to existing user ${manager.username}`);
          }
        }

        createdManagers.push({
          id: existingProfile.id,
          username: existingProfile.username,
          email: manager.email,
          role: manager.role,
        });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: manager.email,
        password: "RiftManager2024!",
        email_confirm: true,
        user_metadata: {
          username: manager.username,
          country: manager.country,
        },
      });

      if (authError) {
        console.error(`Error creating user ${manager.email}:`, authError);
        
        // Check if user exists in auth but profile doesn't exist
        const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingAuth.users.find((u) => u.email === manager.email);
        
        if (existingUser) {
          // User exists in auth, add role
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: existingUser.id, role: manager.role })
            .select()
            .maybeSingle();

          if (roleError && !roleError.message.includes("duplicate")) {
            errors.push({ email: manager.email, error: roleError.message });
          }

          createdManagers.push({
            id: existingUser.id,
            username: manager.username,
            email: manager.email,
            role: manager.role,
          });
        } else {
          errors.push({ email: manager.email, error: authError.message });
        }
        continue;
      }

      if (authData.user) {
        // Add the specific role (trigger already adds 'player' role)
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: manager.role });

        if (roleError) {
          console.error(`Error adding role for ${manager.email}:`, roleError);
          errors.push({ email: manager.email, error: `User created but role failed: ${roleError.message}` });
        } else {
          console.log(`Successfully created ${manager.username} with role ${manager.role}`);
        }

        createdManagers.push({
          id: authData.user.id,
          username: manager.username,
          email: manager.email,
          role: manager.role,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${createdManagers.length} platform managers`,
        managers: createdManagers,
        errors: errors.length > 0 ? errors : undefined,
        credentials: {
          password: "RiftManager2024!",
          note: "Use these credentials to login. Change password after first login.",
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create-platform-managers:", error);
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

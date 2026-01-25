import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, Search, UserPlus, UserMinus, Users, Loader2, 
  ChevronDown, Check, X, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AppRole = "player" | "organizer" | "sponsor" | "admin";

interface UserWithRoles {
  id: string;
  username: string;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  roles: AppRole[];
}

const AVAILABLE_ROLES: AppRole[] = ["player", "organizer", "sponsor", "admin"];

const AdminUsers = () => {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [pendingAction, setPendingAction] = useState<{
    type: "add" | "remove";
    userId: string;
    username: string;
    role: AppRole;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    
    // First get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast.error("Failed to load users");
      setIsLoading(false);
      return;
    }

    // Then get all roles for each user
    const usersWithRoles: UserWithRoles[] = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id);
        
        return {
          ...profile,
          roles: (roles?.map(r => r.role as AppRole)) || [],
        };
      })
    );

    setUsers(usersWithRoles);
    setFilteredUsers(usersWithRoles);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          u.country?.toLowerCase().includes(query) ||
          u.id.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.roles.includes(roleFilter));
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  // Add role to user
  const addRole = async (userId: string, role: AppRole) => {
    setActionLoading(true);
    
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) {
      if (error.code === "23505") {
        toast.error("User already has this role");
      } else {
        console.error("Error adding role:", error);
        toast.error("Failed to add role");
      }
    } else {
      toast.success(`Role "${role}" added successfully`);
      fetchUsers();
    }

    setActionLoading(false);
    setPendingAction(null);
  };

  // Remove role from user
  const removeRole = async (userId: string, role: AppRole) => {
    setActionLoading(true);
    
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role");
    } else {
      toast.success(`Role "${role}" removed successfully`);
      fetchUsers();
    }

    setActionLoading(false);
    setPendingAction(null);
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin": return "diamond";
      case "organizer": return "gold";
      case "sponsor": return "platinum";
      case "player": return "default";
      default: return "outline";
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-destructive" />
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
                User Management
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage platform users and assign roles. Only admins can access this page.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-4 mb-8"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-3 py-4">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-display font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Users</p>
                </div>
              </RiftCardContent>
            </RiftCard>
            {AVAILABLE_ROLES.map((role) => (
              <RiftCard key={role}>
                <RiftCardContent className="flex items-center gap-3 py-4">
                  <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {users.filter((u) => u.roles.includes(role)).length}
                    </p>
                  </div>
                </RiftCardContent>
              </RiftCard>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, country, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={roleFilter === "all" ? "rift" : "rift-outline"}
                size="sm"
                onClick={() => setRoleFilter("all")}
              >
                All
              </Button>
              {AVAILABLE_ROLES.map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? "rift" : "rift-outline"}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RiftCard>
              <RiftCardHeader>
                <RiftCardTitle>
                  Users ({filteredUsers.length})
                </RiftCardTitle>
              </RiftCardHeader>
              <RiftCardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          <th className="px-4 py-3 text-left text-xs font-display uppercase tracking-wider text-muted-foreground">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-display uppercase tracking-wider text-muted-foreground">
                            Location
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-display uppercase tracking-wider text-muted-foreground">
                            Roles
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-display uppercase tracking-wider text-muted-foreground">
                            Joined
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-display uppercase tracking-wider text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, index) => (
                          <motion.tr
                            key={u.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="border-b border-border hover:bg-secondary/30 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-sm bg-secondary flex items-center justify-center overflow-hidden">
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt={u.username} className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="font-display text-lg font-bold text-muted-foreground">
                                      {u.username.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-display font-semibold uppercase tracking-wide">
                                    {u.username}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {u.id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-muted-foreground">
                                {u.country || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {u.roles.length > 0 ? (
                                  u.roles.map((role) => (
                                    <Badge key={role} variant={getRoleBadgeVariant(role)} size="sm">
                                      {role}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">No roles</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-muted-foreground">
                                {new Date(u.created_at).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="rift-outline" size="sm">
                                    Manage Roles
                                    <ChevronDown className="ml-2 h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <div className="px-2 py-1.5 text-xs font-display uppercase tracking-wider text-muted-foreground">
                                    Add Role
                                  </div>
                                  {AVAILABLE_ROLES.filter((role) => !u.roles.includes(role)).map((role) => (
                                    <DropdownMenuItem
                                      key={`add-${role}`}
                                      onClick={() =>
                                        setPendingAction({
                                          type: "add",
                                          userId: u.id,
                                          username: u.username,
                                          role,
                                        })
                                      }
                                      className="cursor-pointer"
                                    >
                                      <UserPlus className="mr-2 h-4 w-4 text-success" />
                                      Add {role}
                                    </DropdownMenuItem>
                                  ))}
                                  {u.roles.length > 0 && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <div className="px-2 py-1.5 text-xs font-display uppercase tracking-wider text-muted-foreground">
                                        Remove Role
                                      </div>
                                      {u.roles.map((role) => (
                                        <DropdownMenuItem
                                          key={`remove-${role}`}
                                          onClick={() =>
                                            setPendingAction({
                                              type: "remove",
                                              userId: u.id,
                                              username: u.username,
                                              role,
                                            })
                                          }
                                          className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                          <UserMinus className="mr-2 h-4 w-4" />
                                          Remove {role}
                                        </DropdownMenuItem>
                                      ))}
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </RiftCardContent>
            </RiftCard>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase tracking-wide flex items-center gap-2">
              {pendingAction?.type === "add" ? (
                <UserPlus className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {pendingAction?.type === "add" ? "Add Role" : "Remove Role"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "add" ? (
                <>
                  Are you sure you want to add the <Badge variant={getRoleBadgeVariant(pendingAction.role)}>{pendingAction.role}</Badge> role to <strong>{pendingAction.username}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to remove the <Badge variant={getRoleBadgeVariant(pendingAction?.role || "player")}>{pendingAction?.role}</Badge> role from <strong>{pendingAction?.username}</strong>?
                  {pendingAction?.role === "admin" && (
                    <span className="block mt-2 text-destructive">
                      Warning: This will revoke their admin privileges.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingAction) {
                  if (pendingAction.type === "add") {
                    addRole(pendingAction.userId, pendingAction.role);
                  } else {
                    removeRole(pendingAction.userId, pendingAction.role);
                  }
                }
              }}
              disabled={actionLoading}
              className={pendingAction?.type === "remove" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : pendingAction?.type === "add" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Add Role
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Remove Role
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;

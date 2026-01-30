import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, Mail, Building2, User, Phone, Globe, 
  Loader2, Clock, CheckCircle, XCircle, MessageSquare,
  Calendar, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface PartnershipInquiry {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  preferred_tier: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending: "warning",
  contacted: "default",
  negotiating: "secondary",
  approved: "success",
  rejected: "destructive",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  contacted: Mail,
  negotiating: MessageSquare,
  approved: CheckCircle,
  rejected: XCircle,
};

const AdminPartnershipInquiries = () => {
  const { t } = useTranslation();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<PartnershipInquiry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, authLoading, navigate]);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["partnership-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PartnershipInquiry[];
    },
    enabled: isAdmin,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("partnership_inquiries")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnership-inquiries"] });
      toast.success(t("adminPartnerships.statusUpdated"));
    },
    onError: () => {
      toast.error(t("adminPartnerships.statusError"));
    },
  });

  const handleStatusChange = (inquiryId: string, newStatus: string) => {
    updateStatus.mutate({ id: inquiryId, status: newStatus });
  };

  const openDetails = (inquiry: PartnershipInquiry) => {
    setSelectedInquiry(inquiry);
    setDetailsOpen(true);
  };

  const getTierBadgeVariant = (tier: string | null) => {
    switch (tier) {
      case "platinum": return "diamond";
      case "gold": return "warning";
      case "silver": return "secondary";
      default: return "outline";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingCount = inquiries?.filter(i => i.status === "pending").length || 0;
  const contactedCount = inquiries?.filter(i => i.status === "contacted").length || 0;
  const approvedCount = inquiries?.filter(i => i.status === "approved").length || 0;

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
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="diamond" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin Only
              </Badge>
            </div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              {t("adminPartnerships.title")}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {t("adminPartnerships.description")}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-3 mb-8"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{pendingCount}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("adminPartnerships.pending")}
                  </p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{contactedCount}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("adminPartnerships.contacted")}
                  </p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{approvedCount}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("adminPartnerships.approved")}
                  </p>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Inquiries Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RiftCard>
              <RiftCardHeader>
                <RiftCardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {t("adminPartnerships.allInquiries")}
                </RiftCardTitle>
              </RiftCardHeader>
              <RiftCardContent>
                {inquiries && inquiries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminPartnerships.company")}</TableHead>
                          <TableHead>{t("adminPartnerships.contact")}</TableHead>
                          <TableHead>{t("adminPartnerships.tier")}</TableHead>
                          <TableHead>{t("adminPartnerships.date")}</TableHead>
                          <TableHead>{t("adminPartnerships.status")}</TableHead>
                          <TableHead className="text-right">{t("adminPartnerships.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inquiries.map((inquiry) => {
                          const StatusIcon = statusIcons[inquiry.status] || Clock;
                          return (
                            <TableRow key={inquiry.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{inquiry.company_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    {inquiry.contact_name}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {inquiry.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {inquiry.preferred_tier ? (
                                  <Badge variant={getTierBadgeVariant(inquiry.preferred_tier)}>
                                    {inquiry.preferred_tier.charAt(0).toUpperCase() + inquiry.preferred_tier.slice(1)}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(inquiry.created_at), "dd/MM/yyyy")}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={inquiry.status}
                                  onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                                >
                                  <SelectTrigger className="w-[140px] h-8">
                                    <SelectValue>
                                      <div className="flex items-center gap-2">
                                        <StatusIcon className="h-3 w-3" />
                                        <span className="capitalize">{inquiry.status}</span>
                                      </div>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        Pending
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="contacted">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        Contacted
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="negotiating">
                                      <div className="flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" />
                                        Negotiating
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="approved">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3" />
                                        Approved
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                      <div className="flex items-center gap-2">
                                        <XCircle className="h-3 w-3" />
                                        Rejected
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDetails(inquiry)}
                                >
                                  {t("adminPartnerships.viewDetails")}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{t("adminPartnerships.noInquiries")}</p>
                  </div>
                )}
              </RiftCardContent>
            </RiftCard>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedInquiry?.company_name}
            </DialogTitle>
            <DialogDescription>
              {t("adminPartnerships.inquiryDetails")}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("adminPartnerships.contact")}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedInquiry.contact_name}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("adminPartnerships.tier")}
                  </label>
                  <div className="mt-1">
                    {selectedInquiry.preferred_tier ? (
                      <Badge variant={getTierBadgeVariant(selectedInquiry.preferred_tier)}>
                        {selectedInquiry.preferred_tier.charAt(0).toUpperCase() + selectedInquiry.preferred_tier.slice(1)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
              </div>

              {selectedInquiry.phone && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("adminPartnerships.phone")}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedInquiry.phone}</span>
                  </div>
                </div>
              )}

              {selectedInquiry.website && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Website
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={selectedInquiry.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {selectedInquiry.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("adminPartnerships.message")}
                </label>
                <div className="mt-1 p-3 bg-secondary/50 rounded-sm">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  {t("adminPartnerships.submittedOn")} {format(new Date(selectedInquiry.created_at), "dd/MM/yyyy HH:mm")}
                </div>
                <Button
                  variant="rift"
                  size="sm"
                  onClick={() => window.location.href = `mailto:${selectedInquiry.email}?subject=Re: Partnership Inquiry - Rift Arena`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t("adminPartnerships.reply")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPartnershipInquiries;

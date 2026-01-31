import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Loader2, CheckCircle } from "lucide-react";

const partnershipSchema = z.object({
  company_name: z.string().trim().min(2, { message: "Company name must be at least 2 characters" }).max(100),
  contact_name: z.string().trim().min(2, { message: "Contact name must be at least 2 characters" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  website: z.string().trim().url({ message: "Invalid URL" }).max(255).optional().or(z.literal("")),
  preferred_tier: z.string().optional(),
  message: z.string().trim().min(20, { message: "Message must be at least 20 characters" }).max(2000),
});

type PartnershipFormData = z.infer<typeof partnershipSchema>;

interface PartnershipContactFormProps {
  children: React.ReactNode;
  defaultTier?: string;
}

export function PartnershipContactForm({ children, defaultTier }: PartnershipContactFormProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      website: "",
      preferred_tier: defaultTier || "",
      message: "",
    },
  });

  const onSubmit = async (data: PartnershipFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("partnership_inquiries").insert({
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        preferred_tier: data.preferred_tier || null,
        message: data.message,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(t("sponsors.form.successToast"));
      
      setTimeout(() => {
        setOpen(false);
        setIsSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting partnership inquiry:", error);
      toast.error(t("sponsors.form.errorToast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsSuccess(false);
      form.reset({ 
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        website: "",
        preferred_tier: defaultTier || "",
        message: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("sponsors.form.successTitle")}</h3>
            <p className="text-muted-foreground">{t("sponsors.form.successMessage")}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {t("sponsors.form.title")}
              </DialogTitle>
              <DialogDescription>
                {t("sponsors.form.description")}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("sponsors.form.companyName")} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("sponsors.form.contactName")} *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("sponsors.form.email")} *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("sponsors.form.phone")}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sponsors.form.website")}</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sponsors.form.preferredTier")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("sponsors.form.selectTier")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="platinum">Platinum</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="undecided">{t("sponsors.form.undecided")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sponsors.form.message")} *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("sponsors.form.messagePlaceholder")}
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="rift"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("sponsors.form.submitting")}
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      {t("sponsors.form.submit")}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

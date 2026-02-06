import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import {
  Bell, TrendingDown, Trophy, Users, Swords,
  CheckCheck, Trash2, Check, Filter, ArrowLeft, Loader2
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { SEOHead } from "@/components/seo/SEOHead";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useAllNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  Notification,
} from "@/hooks/useNotifications";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState } from "@/components/ui/empty-state";

const NOTIFICATION_TYPES = ["all", "team_invite", "match_result", "tournament_update", "rank_overtake"] as const;
type NotificationType = typeof NOTIFICATION_TYPES[number];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "rank_overtake":
      return <TrendingDown className="h-5 w-5 text-destructive" />;
    case "tournament_update":
      return <Trophy className="h-5 w-5 text-primary" />;
    case "team_invite":
      return <Users className="h-5 w-5 text-success" />;
    case "match_result":
      return <Swords className="h-5 w-5 text-warning" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (type) {
    case "rank_overtake":
      return "destructive";
    case "team_invite":
      return "default";
    case "match_result":
      return "secondary";
    case "tournament_update":
      return "outline";
    default:
      return "secondary";
  }
};

const NotificationsHistory = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const locale = i18n.language === "pt" ? pt : enUS;

  const [activeFilter, setActiveFilter] = useState<NotificationType>("all");

  const { notifications, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useAllNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    notifications.forEach((n) => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersectionObserver({
    enabled: !!hasNextPage && !isFetchingNextPage,
    onIntersect: loadMore,
  });

  const handleClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    const data = notification.data as Record<string, unknown>;
    switch (notification.type) {
      case "rank_overtake":
        if (data?.overtaker_id) navigate(`/player/${data.overtaker_id}`);
        break;
      case "team_invite":
        if (data?.team_id) navigate(`/teams/${data.team_id}`);
        break;
      case "match_result":
      case "tournament_update":
        if (data?.tournament_id) navigate(`/tournaments/${data.tournament_id}`);
        break;
    }
  };

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={t("notificationsPage.title")} noIndex />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <PageBreadcrumbs
            items={[
              { label: t("dashboard.title"), href: "/dashboard" },
              { label: t("notificationsPage.title") },
            ]}
            className="mb-6"
          />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold uppercase tracking-wide flex items-center gap-3">
                  <Bell className="h-7 w-7 text-primary" />
                  {t("notificationsPage.title")}
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-sm">
                      {unreadCount}
                    </Badge>
                  )}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t("notificationsPage.subtitle")}
                </p>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="rift-outline"
                    size="sm"
                    onClick={() => markAllAsRead.mutate()}
                    disabled={markAllAsRead.isPending}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    {t("notifications.markAllAsRead")}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("common.back")}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as NotificationType)}>
              <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
                {NOTIFICATION_TYPES.map((type) => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-xs font-medium"
                  >
                    {t(`notificationsPage.filter.${type}`)}
                    {typeCounts[type] ? (
                      <span className="ml-1.5 opacity-70">({typeCounts[type]})</span>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Notification List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RiftCard hover={false}>
              <RiftCardContent>
                {isLoading ? (
                  <div className="space-y-3 p-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-sm bg-secondary/30 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-muted rounded" />
                          <div className="h-3 w-1/2 bg-muted rounded" />
                          <div className="h-2 w-24 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <EmptyState
                    icon={activeFilter === "all" ? Bell : Filter}
                    title={t("notificationsPage.empty")}
                    description={
                      activeFilter !== "all"
                        ? t("notificationsPage.emptyFiltered")
                        : t("notificationsPage.emptyDesc")
                    }
                  />
                ) : (
                  <div className="divide-y divide-border">
                    <AnimatePresence mode="popLayout">
                      {filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ delay: Math.min(index * 0.03, 0.3) }}
                          className={cn(
                            "flex items-start gap-4 p-4 cursor-pointer transition-colors group",
                            notification.read
                              ? "hover:bg-secondary/30"
                              : "bg-primary/5 hover:bg-primary/10"
                          )}
                          onClick={() => handleClick(notification)}
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className={cn(
                                    "text-sm leading-tight",
                                    !notification.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                                  )}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Badge variant={getTypeBadgeVariant(notification.type)} className="text-[10px] px-1.5 py-0">
                                    {t(`notificationsPage.filter.${notification.type}`)}
                                  </Badge>
                                  <span className="text-[11px] text-muted-foreground/60">
                                    {formatDistanceToNow(new Date(notification.created_at), {
                                      addSuffix: true,
                                      locale,
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead.mutate(notification.id);
                                    }}
                                    title={t("notificationsPage.markAsRead")}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification.mutate(notification.id);
                                  }}
                                  title={t("common.delete")}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-1" />

                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">{t("common.loading")}</span>
                      </div>
                    )}

                    {!hasNextPage && notifications.length > 0 && (
                      <p className="text-center text-xs text-muted-foreground/50 py-4">
                        {t("notificationsPage.allLoaded")}
                      </p>
                    )}
                  </div>
                )}
              </RiftCardContent>
            </RiftCard>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsHistory;

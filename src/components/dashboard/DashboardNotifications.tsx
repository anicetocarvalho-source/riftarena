import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, TrendingDown, Trophy, Users, Swords, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useUnreadNotificationsCount,
  Notification,
} from "@/hooks/useNotifications";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "rank_overtake":
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    case "tournament_update":
      return <Trophy className="h-4 w-4 text-primary" />;
    case "team_invite":
      return <Users className="h-4 w-4 text-success" />;
    case "match_result":
      return <Swords className="h-4 w-4 text-warning" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export function DashboardNotifications() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const locale = i18n.language === "pt" ? pt : enUS;

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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-sm bg-secondary/30 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-muted rounded" />
              <div className="h-2 w-1/2 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          {t("dashboard.noNotifications")}
        </p>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">
            {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2 text-xs"
            onClick={() => markAllAsRead.mutate()}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            {t("notifications.markAllAsRead")}
          </Button>
        </div>
      )}
      <ScrollArea className="h-[280px]">
        <AnimatePresence mode="popLayout">
          {notifications.slice(0, 10).map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-sm cursor-pointer transition-colors mb-1",
                notification.read
                  ? "bg-transparent hover:bg-secondary/30"
                  : "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
              )}
              onClick={() => handleClick(notification)}
            >
              <div className="flex-shrink-0 mt-0.5 h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm leading-tight",
                  !notification.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                )}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale,
                  })}
                </p>
              </div>
              {!notification.read && (
                <div className="flex-shrink-0 mt-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
      {notifications.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs text-muted-foreground"
          onClick={() => navigate("/notifications")}
        >
          {t("notificationsPage.viewAll")}
        </Button>
      )}
    </div>
  );
}

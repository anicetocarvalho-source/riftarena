import { Bell, Check, CheckCheck, Trash2, TrendingDown, Trophy, Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  Notification,
} from "@/hooks/useNotifications";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "rank_overtake":
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    case "tournament":
      return <Trophy className="h-4 w-4 text-primary" />;
    case "team":
      return <Users className="h-4 w-4 text-success" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language === "pt" ? pt : enUS;

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-sm cursor-pointer transition-colors group",
        notification.read
          ? "bg-transparent hover:bg-secondary/30"
          : "bg-primary/5 hover:bg-primary/10"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-tight",
          !notification.read && "text-foreground"
        )}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {timeAgo}
        </p>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {!notification.read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}
    </motion.div>
  );
}

export function NotificationDropdown() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === "rank_overtake" && notification.data?.overtaker_id) {
      navigate(`/player/${notification.data.overtaker_id}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background border-border">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t("notifications.title")}
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {t("notifications.markAllAsRead")}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("notifications.empty")}
              </p>
            </div>
          ) : (
            <div className="relative">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={(id) => markAsRead.mutate(id)}
                    onDelete={(id) => deleteNotification.mutate(id)}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  Clock,
  ClipboardList,
  Car,
  Ticket,
  MessageSquare,
  Trash2,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  LogIn,
  ShieldCheck,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { format, formatDistanceToNow } from "date-fns";

const TYPE_CONFIG = {
  auth: {
    icon: LogIn,
    color: "text-[#3F5F8C] bg-[#3F5F8C]/15",
    badgeColor: "bg-[#3F5F8C] text-white",
  },
  user: {
    icon: UserPlus,
    color: "text-[#4B8039] bg-[#4B8039]/15",
    badgeColor: "bg-[#4B8039] text-white",
  },
  booking: {
    icon: ClipboardList,
    color: "text-[#E8826B] bg-[#E8826B]/15",
    badgeColor: "bg-[#E8826B] text-white",
  },
  kyc: {
    icon: ShieldCheck,
    color: "text-[#82C4B7] bg-[#82C4B7]/15",
    badgeColor: "bg-[#82C4B7] text-white",
  },
  fleet: {
    icon: Car,
    color: "text-[#E1B808] bg-[#E1B808]/15",
    badgeColor: "bg-[#212121] text-[#E1B808]",
  },
  lead: {
    icon: MessageSquare,
    color: "text-[#3F5F8C] bg-[#3F5F8C]/15",
    badgeColor: "bg-[#3F5F8C] text-white",
  },
  coupon: {
    icon: Ticket,
    color: "text-[#82C4B7] bg-[#82C4B7]/15",
    badgeColor: "bg-[#82C4B7] text-white",
  },
  payment: {
    icon: CreditCard,
    color: "text-[#4B8039] bg-[#4B8039]/15",
    badgeColor: "bg-[#4B8039] text-white",
  },
  system: {
    icon: Bell,
    color: "text-[#6F6E73] bg-[#6F6E73]/15",
    badgeColor: "bg-[#6F6E73] text-white",
  },
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.notifications.list({ limit: 40 });
      if (res && res.success) {
        const raw = res.notifications || res.data || [];
        const items = raw.map((n) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
          let timeLabel = "Recent";
          if (n.createdAt) {
            try {
              const d = new Date(n.createdAt);
              timeLabel = formatDistanceToNow(d, { addSuffix: true });
            } catch {
              timeLabel = "Recent";
            }
          }

          return {
            ...n,
            id: n.id || n._id,
            icon: cfg.icon,
            color: cfg.color,
            time: timeLabel,
          };
        });

        setNotifications(items);
        setUnreadCount(res.unreadCount != null ? res.unreadCount : items.filter((i) => !i.read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000); // 12-second live refresh
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function markAllRead() {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      await api.notifications.markRead({ all: true });
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  }

  async function toggleRead(id, currentRead, e) {
    e?.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !currentRead } : n))
      );
      setUnreadCount((c) => Math.max(0, currentRead ? c + 1 : c - 1));
      await api.notifications.markRead({ id });
    } catch (err) {
      console.error("Error updating notification status:", err);
    }
  }

  async function deleteNotification(id, e) {
    e?.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
      await api.notifications.delete(id);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  }

  async function clearAll() {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await api.notifications.clearAll();
      toast.success("Notification center cleared");
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2.5 rounded-full bg-[#FFFFFF] hover:bg-white border border-[#DFDCE8] text-[#212121] transition-all cursor-pointer shadow-xs group"
          title="System & Activity Notifications"
          data-testid="admin-notifications-btn"
        >
          <Bell size={16} className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E03131] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E03131] text-[8px] font-mono font-bold text-white items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-[420px] p-0 bg-white border border-[#DFDCE8] rounded-3xl shadow-2xl overflow-hidden font-body text-[#212121] z-50"
      >
        {/* Popover Header */}
        <div className="p-4 bg-[#F6F5FA] border-b border-[#DFDCE8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#212121] text-white flex items-center justify-center">
              <Bell size={14} className="text-[#E1B808]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#212121] leading-none">
                Notifications Center
              </h3>
              <span className="text-[10px] text-[#6F6E73] font-mono">
                Logins, Signups &amp; CRM Actions
              </span>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-[#E03131] text-white font-mono text-[10px] px-2 py-0.2 rounded-full font-bold ml-1">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              title="Refresh notifications"
              className="p-1.5 rounded-lg text-[#6F6E73] hover:text-[#212121] hover:bg-white border border-transparent hover:border-[#DFDCE8] transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-[#212121]" : ""} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-mono font-bold text-[#212121] hover:text-[#4B8039] flex items-center gap-1 transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#DFDCE8]"
              >
                <CheckCheck size={13} className="text-[#4B8039]" /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#DFDCE8] no-scrollbar">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-[#6F6E73] font-mono text-xs">
              <RefreshCw size={22} className="animate-spin mx-auto text-[#212121] mb-2" />
              Syncing live system activity...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 size={34} className="mx-auto text-[#4B8039]" />
              <p className="font-mono text-xs font-bold text-[#212121]">All caught up!</p>
              <p className="text-[11px] text-[#6F6E73]">
                Customer logins, profile registrations, KYC updates, and fleet actions will appear here in real time.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const IconComponent = n.icon || Bell;
              return (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-[#F6F5FA] ${
                    !n.read ? "bg-[#FDFCF7] border-l-4 border-l-[#E1B808]" : "opacity-85"
                  }`}
                >
                  <div className={`p-2 rounded-2xl shrink-0 mt-0.5 ${n.color}`}>
                    <IconComponent size={15} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={n.link || "/admin"}
                      onClick={() => {
                        if (!n.read) toggleRead(n.id, false);
                        setOpen(false);
                      }}
                      className="block group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#212121] group-hover:text-[#212121] transition-colors truncate">
                          {n.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#99989E] shrink-0 flex items-center gap-1">
                          <Clock size={10} /> {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F6E73] mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => toggleRead(n.id, n.read, e)}
                      title={n.read ? "Mark as unread" : "Mark as read"}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        n.read ? "text-[#99989E] hover:text-[#212121]" : "text-[#4B8039] bg-[#CFDECA]/40"
                      }`}
                    >
                      <CheckCheck size={13} />
                    </button>
                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      title="Delete notification"
                      className="p-1.5 rounded-lg text-[#99989E] hover:text-[#E03131] hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Popover Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-[#F6F5FA] border-t border-[#DFDCE8] flex items-center justify-between text-xs">
            <button
              onClick={clearAll}
              className="text-[11px] font-mono text-[#E03131] hover:underline font-bold cursor-pointer"
            >
              Clear all notifications
            </button>
            <Link
              to="/admin/bookings"
              onClick={() => setOpen(false)}
              className="text-[11px] font-mono text-[#212121] font-bold hover:underline flex items-center gap-1"
            >
              <span>View CRM Portal</span> →
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

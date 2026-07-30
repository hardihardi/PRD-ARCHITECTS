import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, Info, AlertCircle, Clock, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../contexts/LanguageContext";

type Notification = {
  id: string;
  titleKey: string;
  messageKey: string;
  type: "info" | "success" | "warning";
  timeKey: string;
  isRead: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: "1",
    titleKey: "header.systemUpdatedTitle",
    messageKey: "header.systemUpdatedMsg",
    type: "info",
    timeKey: "header.time10mAgo",
    isRead: false,
  },
  {
    id: "2",
    titleKey: "header.prdCreatedTitle",
    messageKey: "header.prdCreatedMsg",
    type: "success",
    timeKey: "header.time2hAgo",
    isRead: false,
  },
  {
    id: "3",
    titleKey: "header.quotaWarningTitle",
    messageKey: "header.quotaWarningMsg",
    type: "warning",
    timeKey: "header.time1dAgo",
    isRead: true,
  }
];

export function HeaderNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#7a838b] hover:text-[#696cff] transition-colors focus:outline-none rounded-xl hover:bg-[#f5f5f9] cursor-pointer"
        title={t("header.notifications")}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3e1d] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff3e1d]"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -right-14 sm:right-0 top-[110%] sm:top-full mt-2 w-[300px] sm:w-[360px] rounded-xl bg-white shadow-[0_4px_20px_0_rgba(67,89,113,0.18)] border border-[#e4e6e8] z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-200">
          <div className="flex items-center justify-between p-4 border-b border-[#e4e6e8] bg-[#f5f5f9]/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#384756]">{t("header.notifications")}</h3>
              {unreadCount > 0 && (
                <span className="bg-[#e7e7ff] text-[#696cff] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {t("header.newBadge", { count: unreadCount })}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-[#696cff] hover:text-[#5a5ddb] transition-colors cursor-pointer"
              >
                {t("header.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-[320px] sm:max-h-[360px] overflow-y-auto bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium">{t("header.noNotifications")}</p>
                <p className="text-xs text-gray-400">{t("header.allCaughtUp")}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 sm:p-4 hover:bg-gray-50 transition-colors group relative flex gap-3",
                      !notification.isRead ? "bg-indigo-50/30" : "bg-white"
                    )}
                  >
                    <div className="shrink-0 mt-0.5">
                      {notification.type === "success" && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />}
                      {notification.type === "info" && <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
                      {notification.type === "warning" && <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />}
                    </div>
                    <div className="flex-1 pr-6">
                      <p className={cn("text-xs sm:text-sm font-semibold mb-1", !notification.isRead ? "text-gray-900" : "text-gray-700")}>
                        {t(notification.titleKey)}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {t(notification.messageKey)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] sm:text-xs text-gray-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {t(notification.timeKey)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => removeNotification(notification.id, e)}
                      className="absolute right-2 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 sm:p-3 border-t border-gray-100 bg-white">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors py-1 sm:py-1.5 rounded-lg hover:bg-indigo-50"
              >
                {t("header.viewAllNotifications")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

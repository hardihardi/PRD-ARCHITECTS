import React, { useState, useEffect } from "react";
import { Activity, Clock, Trash2 } from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  getDocs,
  limit,
} from "firebase/firestore";
import { useDataTable } from "../hooks/useDataTable";
import { DataTableControls, Pagination } from "../components/DataTableControls";
import { useTranslation } from "../contexts/LanguageContext";

interface LogData {
  id: string;
  action: string;
  details: string;
  createdAt: any;
}

export function Logs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Only fetch the last 100 logs
    const q = query(
      collection(db, "logs"),
      orderBy("createdAt", "desc"),
      limit(100),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: LogData[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as LogData);
        });
        setLogs(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching logs:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleClearLogs = async () => {
    if (
      !window.confirm(
        t("logs.confirmClear"),
      )
    )
      return;
    setIsClearing(true);
    try {
      const snapshot = await getDocs(collection(db, "logs"));
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing logs:", error);
      alert(t("logs.clearFailed"));
    } finally {
      setIsClearing(false);
    }
  };

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filteredData,
    currentData,
    exportCSV,
    exportPDF
  } = useDataTable<LogData>({
    data: logs,
    searchFields: ["action", "details"],
    initialPageSize: 10
  });

  return (
    <div className="w-full space-y-6 pb-12 text-[#566a7f]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
        <div>
          <h1 className="text-xl font-bold text-[#384756] tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#696cff]" />
            {t("logs.title")}
          </h1>
          <p className="mt-1 text-xs text-[#7a838b]">
            {t("logs.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              disabled={isClearing}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#ffebe8] text-[#ff3e1d] border border-[#ff3e1d]/30 px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              {t("logs.clearLogs")}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#e4e6e8] flex flex-col gap-4">
        <DataTableControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onExportCSV={() => exportCSV('Log_Aktivitas', [
            { header: "Action", key: "action" },
            { header: "Details", key: "details" },
            { header: t("logs.colTime"), key: (l) => l.createdAt ? new Date(l.createdAt.seconds * 1000).toLocaleString() : "" }
          ])}
          onExportPDF={() => exportPDF('logs-content', 'Log_Aktivitas')}
          searchPlaceholder={t("logs.searchPlaceholder")}
        />
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#e4e6e8] overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#696cff]"></div>
          </div>
        ) : logs.length > 0 ? (
          <div id="logs-content">
            <ul role="list" className="divide-y divide-[#e4e6e8]">
              {currentData.map((log) => (
                <li
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-[#f5f5f9]/80 flex flex-col sm:flex-row sm:items-start gap-4 transition-colors"
                >
                  <div className="hidden sm:flex bg-[#e7e7ff] mt-1 p-2.5 rounded-xl shrink-0 text-[#696cff]">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="sm:hidden bg-[#e7e7ff] p-1.5 rounded-lg shrink-0 text-[#696cff]">
                          <Activity className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold text-[#384756]">
                          {log.action}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#7a838b] font-semibold whitespace-nowrap bg-[#f5f5f9] px-2.5 py-1 rounded-md border border-[#e4e6e8] shrink-0 hidden sm:flex">
                        <Clock className="w-3.5 h-3.5 text-[#696cff]" />
                        <span>
                          {log.createdAt
                            ? new Date(
                                log.createdAt.seconds * 1000,
                              ).toLocaleString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : t("logs.justNow")}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#566a7f] break-words mt-1 leading-relaxed">
                      {log.details}
                    </p>

                    {/* Mobile Time View */}
                    <div className="flex sm:hidden items-center gap-1 mt-3 text-[11px] text-[#a1acb8]">
                      <Clock className="w-3 h-3" />
                      <span>
                        {log.createdAt
                          ? new Date(log.createdAt.seconds * 1000).toLocaleString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : t("logs.justNow")}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
              {currentData.length === 0 && (
                <li className="p-8 text-center text-xs font-semibold text-[#a1acb8]">
                  {t("logs.noMatchingLogs")}
                </li>
              )}
            </ul>
            {currentData.length > 0 && (
              <div data-html2canvas-ignore="true">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil(filteredData.length / pageSize))}
                  setCurrentPage={setCurrentPage}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  totalItems={filteredData.length}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center min-h-[350px] flex flex-col items-center justify-center">
            <div className="bg-[#e7e7ff] p-4 rounded-2xl mb-4 text-[#696cff]">
              <Activity className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-[#384756] mb-1">
              {t("logs.emptyStateTitle")}
            </h3>
            <p className="text-xs text-[#7a838b] max-w-sm leading-relaxed">
              {t("logs.emptyStateDesc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

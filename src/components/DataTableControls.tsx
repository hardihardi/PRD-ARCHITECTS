import React from "react";
import { Download, FileText, ChevronLeft, ChevronRight, Search, FileDown, Trash2, X } from "lucide-react";
import { useTranslation } from "../contexts/LanguageContext";

interface DataTableControlsProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  searchPlaceholder?: string;
  filterComponent?: React.ReactNode;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
  isDeleting?: boolean;
}

export function DataTableControls({
  searchQuery,
  setSearchQuery,
  onExportCSV,
  onExportPDF,
  searchPlaceholder,
  filterComponent,
  selectedCount = 0,
  onBulkDelete,
  onClearSelection,
  isDeleting = false
}: DataTableControlsProps) {
  const { t } = useTranslation();
  const effectivePlaceholder = searchPlaceholder || t("common.search");

  return (
    <div className="w-full flex flex-col gap-4 rounded-xl">
        {selectedCount > 0 && onBulkDelete && (
          <div 
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-lg bg-white text-slate-800 px-5 py-4 rounded-2xl shadow-xl border border-slate-200 flex items-center justify-between animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-rose-600 text-white text-xs font-bold animate-pulse">
                {selectedCount}
              </span>
              <span className="text-sm font-semibold text-slate-800 tracking-wide">
                {t("common.selected")}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer active:scale-95"
                >
                  {t("common.cancel")}
                </button>
              )}
              <button
                onClick={onBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 shadow-md cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t("common.bulkDelete")}</span>
              </button>
            </div>
          </div>
        )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={effectivePlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm transition-all"
            />
          </div>
          {filterComponent}
        </div>
        
        {/* Export Actions */}
        <div className="flex gap-2 w-full sm:w-auto self-end sm:self-auto shrink-0">
          <button
            onClick={onExportCSV}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-white text-gray-700 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t("common.exportCSV")}</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={onExportPDF}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-white text-gray-700 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            <FileDown className="h-4 w-4 text-red-500" />
            <span className="hidden sm:inline">{t("common.exportPDF")}</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalItems
}: PaginationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-white px-4 py-3 sm:px-6 w-full rounded-b-2xl">
      <div className="flex flex-col gap-4 sm:hidden w-full mb-3">
        <div className="flex justify-between items-center w-full">
          <p className="text-sm text-gray-700">
            {t("datatable.pageShort")} <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border-gray-300 rounded-md text-sm py-1 pl-2 pr-6 border bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={5}>5{t("datatable.perPageShort")}</option>
              <option value={10}>10{t("datatable.perPageShort")}</option>
              <option value={25}>25{t("datatable.perPageShort")}</option>
              <option value={50}>50{t("datatable.perPageShort")}</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex-1 mr-2 relative inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("datatable.previous")}
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex-1 ml-2 relative inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("datatable.next")}
          </button>
        </div>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            {t("datatable.page")} <span className="font-medium">{currentPage}</span> {t("datatable.of")} <span className="font-medium">{totalPages}</span> ({t("datatable.totalItems", { count: totalItems })})
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">{t("datatable.perRow")}:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border-gray-300 rounded-md text-sm py-1 pl-2 pr-6 border bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

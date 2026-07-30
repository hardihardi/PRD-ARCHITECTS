import React, { useState, useEffect } from "react";
import {
  Layers,
  Search,
  Calendar,
  Folder,
  Trash2,
  Eye,
  X,
  Copy,
  Check,
  Download,
  FileDown,
  Share,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../lib/utils";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { ShareTemplateModal } from "../components/prd/ShareTemplateModal";
import { useDataTable } from "../hooks/useDataTable";
import { DataTableControls } from "../components/DataTableControls";
import { useTranslation } from "../contexts/LanguageContext";

interface DesignDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  color: string;
  content?: string;
  prompt?: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
}

export function LibraryDesign() {
  const { t } = useTranslation();
  const [designs, setDesigns] = useState<DesignDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection and Bulk Actions States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: "single" | "bulk" | null;
    idToDelete: string | null;
    nameToDelete: string | null;
  }>({
    isOpen: false,
    type: null,
    idToDelete: null,
    nameToDelete: null,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modal detail states
  const [selectedDesign, setSelectedDesign] = useState<DesignDocument | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "designs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const parsedDesigns = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DesignDocument[];
        setDesigns(parsedDesigns);
        setLoading(false);
      },
      (error) => {
        console.warn("Error fetching library designs:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const copyToClipboard = async () => {
    if (selectedDesign?.content) {
      await navigator.clipboard.writeText(selectedDesign.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const downloadMarkdown = () => {
    if (selectedDesign?.content) {
      const blob = new Blob([selectedDesign.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedDesign.title.replace(/\s+/g, "-")}-Design-System.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const exportToPdf = () => {
    const element = document.getElementById("design-modal-export-content");
    if (element) {
      element.classList.add("print-target");
      document.body.classList.add("printing-element-active");
      const originalTitle = document.title;
      document.title = `${selectedDesign?.title ? selectedDesign.title.replace(/\s+/g, "-") : "Design"}-System`;
      
      window.print();
      
      document.title = originalTitle;
      document.body.classList.remove("printing-element-active");
      element.classList.remove("print-target");
    }
  };

  const {
    searchQuery,
    setSearchQuery,
    filterValue: filterType,
    setFilterValue: setFilterType,
    filteredData: filteredDesigns,
    exportCSV,
    exportPDF,
  } = useDataTable<DesignDocument>({
    data: designs,
    searchFields: ["title", "type", "status", "prompt"],
    filterField: "type",
    initialPageSize: 100,
  });

  const isAllCurrentSelected = filteredDesigns.length > 0 && filteredDesigns.every((item) => selectedIds.includes(item.id));
  const isSomeCurrentSelected = filteredDesigns.length > 0 && filteredDesigns.some((item) => selectedIds.includes(item.id)) && !isAllCurrentSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds((prev) => {
        const unique = new Set([...prev, ...filteredDesigns.map((item) => item.id)]);
        return Array.from(unique);
      });
    } else {
      setSelectedIds((prev) => prev.filter((id) => !filteredDesigns.map((item) => item.id).includes(id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openDeleteModalSingle = (id: string, title: string) => {
    setDeleteModalState({
      isOpen: true,
      type: "single",
      idToDelete: id,
      nameToDelete: title,
    });
  };

  const openDeleteModalBulk = () => {
    setDeleteModalState({
      isOpen: true,
      type: "bulk",
      idToDelete: null,
      nameToDelete: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      type: null,
      idToDelete: null,
      nameToDelete: null,
    });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModalState.type === "single" && deleteModalState.idToDelete) {
        await deleteDoc(doc(db, "designs", deleteModalState.idToDelete));
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModalState.idToDelete));
        if (selectedDesign?.id === deleteModalState.idToDelete) {
          setSelectedDesign(null);
        }
        showToast(t("libraryDesign.designDocDeletedSingle", { name: deleteModalState.nameToDelete || "" }));
      } else if (deleteModalState.type === "bulk" && selectedIds.length > 0) {
        const count = selectedIds.length;
        await Promise.all(
          selectedIds.map((id) => deleteDoc(doc(db, "designs", id))),
        );
        if (selectedDesign && selectedIds.includes(selectedDesign.id)) {
          setSelectedDesign(null);
        }
        setSelectedIds([]);
        showToast(t("libraryDesign.designDocDeletedBulk", { count }));
      }
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting designs:", error);
      showToast(t("libraryDesign.deleteFailed"), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-600" />
            {t("libraryDesign.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("libraryDesign.subtitle")}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <DataTableControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCount={selectedIds.length}
          onBulkDelete={openDeleteModalBulk}
          onClearSelection={() => setSelectedIds([])}
          isDeleting={isDeleting}
          onExportCSV={() => exportCSV('Library_Design', [
            { header: t("libraryDesign.colDesignName"), key: "title" },
            { header: t("libraryDesign.colType"), key: "type" },
            { header: t("libraryDesign.colStatus"), key: "status" },
            { header: t("libraryDesign.colCreated"), key: (item) => item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : t("libraryDesign.justNow") }
          ])}
          onExportPDF={() => exportPDF('design-table-container', 'Library_Design')}
          searchPlaceholder={t("libraryDesign.searchPlaceholder")}
          filterComponent={
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 w-full sm:w-48 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm cursor-pointer"
            >
              <option value="all">{t("libraryDesign.allTypes")}</option>
              <option value="Design System">Design System</option>
              <option value="Wireframe">Wireframe</option>
              <option value="UI Kit">UI Kit</option>
            </select>
          }
        />
      </div>

      <div id="design-table-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile View Header: Select All */}
        {!loading && filteredDesigns.length > 0 && (
          <div className="block sm:hidden px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center">
            <input
              id="select-all-mobile"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              checked={isAllCurrentSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isSomeCurrentSelected;
                }
              }}
              onChange={handleSelectAll}
            />
            <label htmlFor="select-all-mobile" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer select-none">
              {t("users.selectAll")} ({t("common.selected", { count: selectedIds.length })})
            </label>
          </div>
        )}

        {/* Mobile View (Cards) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              {t("libraryDesign.loadingLibrary")}
            </div>
          ) : filteredDesigns.length === 0 ? (
             <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                   <Layers className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{t("libraryDesign.emptyDesignTitle")}</h3>
                <p className="text-xs text-slate-500">
                   {t("libraryDesign.emptyDesignDesc")}
                </p>
             </div>
          ) : (
            filteredDesigns.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedDesign(item)}
                className={cn(
                  "p-4 hover:bg-slate-50 transition-colors relative group cursor-pointer active:bg-slate-100 flex items-start gap-3",
                  selectedIds.includes(item.id) && "bg-indigo-50/30"
                )}
              >
                <div className="relative z-20 flex items-center justify-center h-10 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 cursor-pointer text-indigo-600 focus:ring-indigo-600"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSelectOne(item.id)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{item.type || 'Design System'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setSelectedDesign(item)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors bg-gray-50/50"
                        title={t("libraryDesign.viewDetail")}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDeleteModalSingle(item.id, item.title); }} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-gray-50/50"
                        title={t("common.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pl-1">
                    <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded-full", item.color || "bg-indigo-100 text-indigo-700")}>
                      {item.status || 'Final'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : t("libraryDesign.justNow")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4 w-12 text-center" data-html2canvas-ignore="true">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    checked={isAllCurrentSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isSomeCurrentSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">{t("libraryDesign.colDesignName")}</th>
                <th className="px-6 py-4">{t("libraryDesign.colType")}</th>
                <th className="px-6 py-4">{t("libraryDesign.colStatus")}</th>
                <th className="px-6 py-4">{t("libraryDesign.colCreated")}</th>
                <th className="px-6 py-4 text-right" data-html2canvas-ignore="true">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                      {t("libraryDesign.loadingLibrary")}
                    </div>
                  </td>
                </tr>
              ) : filteredDesigns.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Layers className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{t("libraryDesign.emptyDesignTitle")}</h3>
                      <p className="text-sm text-slate-500 max-w-sm">
                        {t("libraryDesign.emptyDesignDesc")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDesigns.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedDesign(item)}
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                      selectedIds.includes(item.id) && "bg-indigo-50/20 hover:bg-indigo-50/30"
                    )}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()} data-html2canvas-ignore="true">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
                          <Folder className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors max-w-[300px] truncate block">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{item.type || 'Design System'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 text-xs font-bold rounded-full", item.color || "bg-indigo-100 text-indigo-700")}>
                        {item.status || 'Final'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : t("libraryDesign.justNow")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()} data-html2canvas-ignore="true">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedDesign(item)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title={t("libraryDesign.viewDetail")}
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openDeleteModalSingle(item.id, item.title); }} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t("common.delete")}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              {t("libraryDesign.confirmDeleteTitle")}
            </h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              {deleteModalState.type === "single" 
                ? t("libraryDesign.confirmDeleteSingle", { name: deleteModalState.nameToDelete || "" }) 
                : t("libraryDesign.confirmDeleteBulk", { count: selectedIds.length })}
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    {t("users.deleting")}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t("users.yesDelete")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Modal Detail View */}
      {selectedDesign && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Backdrop with smooth blur */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in" 
            onClick={() => setSelectedDesign(null)} 
          />

          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-6 lg:p-8">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-5xl animate-scale-up flex flex-col h-[85vh] border border-slate-150">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1" id="modal-title">
                      {selectedDesign.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 font-medium">{selectedDesign.type || 'Design System'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">
                        {selectedDesign.createdAt ? new Date(selectedDesign.createdAt.seconds * 1000).toLocaleDateString() : 'Baru saja'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  onClick={() => setSelectedDesign(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap gap-2 items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full", selectedDesign.color || "bg-indigo-100 text-indigo-700")}>
                    {selectedDesign.status || 'Final'}
                  </span>
                  {selectedDesign.prompt && (
                    <span className="text-xs text-slate-500 truncate max-w-xs hidden md:inline-block">
                      Prompt: {selectedDesign.prompt}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-white border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors text-slate-700 h-9"
                    title={t("libraryDesign.share")}
                  >
                    <Share className="h-4 w-4 text-slate-500" />
                    <span className="hidden sm:inline">{t("libraryDesign.share")}</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="bg-white border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors text-slate-700 h-9"
                    title={t("common.copy")}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-500" />
                    )}
                    <span>{isCopied ? t("common.copied") : t("common.copy")}</span>
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="bg-white border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors text-slate-700 h-9"
                    title={t("common.download")}
                  >
                    <Download className="h-4 w-4 text-slate-500" />
                    <span className="hidden sm:inline">Markdown</span>
                  </button>
                  <button
                    onClick={exportToPdf}
                    className="bg-white border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors text-slate-700 h-9"
                    title={t("common.exportPDF")}
                  >
                    <FileDown className="h-4 w-4 text-slate-500" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Content Pane */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50">
                <div 
                  id="design-modal-export-content" 
                  className="prose prose-sm sm:prose-base prose-slate prose-indigo max-w-none p-6 sm:p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-left whitespace-normal break-words"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedDesign.content || "# No content loaded"}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end flex-shrink-0">
                <button
                  type="button"
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
                  onClick={() => setSelectedDesign(null)}
                >
                  {t("common.close")}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {showShareModal && selectedDesign && (
        <ShareTemplateModal
          onClose={() => setShowShareModal(false)}
          prd={{
            projectName: selectedDesign.title,
            projectDescription: selectedDesign.prompt || `Sistem desain untuk ${selectedDesign.title}`,
            content: selectedDesign.content || "",
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-white text-slate-800 px-5 py-3.5 rounded-2xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
          <span className="text-sm font-semibold tracking-wide text-slate-800">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

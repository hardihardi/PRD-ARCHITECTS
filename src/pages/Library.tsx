import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { FileText, Clock, ExternalLink, Trash2, Pencil, X, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDataTable } from "../hooks/useDataTable";
import { DataTableControls, Pagination } from "../components/DataTableControls";
import { useTranslation } from "../contexts/LanguageContext";

interface PRDDocument {
  id: string;
  projectName: string;
  projectType: string;
  framework: string;
  description: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
}

export function Library() {
  const { t } = useTranslation();
  const [prds, setPrds] = useState<PRDDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    framework: "",
    description: "",
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: "single" | "bulk" | null;
    idToDelete: string | null;
    nameToDelete: string | null;
  }>({ isOpen: false, type: null, idToDelete: null, nameToDelete: null });

  useEffect(() => {
    const q = query(collection(db, "prds"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const parsedPrds = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PRDDocument[];
        setPrds(parsedPrds);
        setLoading(false);
        setErrorMsg("");
      },
      (error) => {
        console.warn("Error fetching library, possibly missing rules:", error);
        setErrorMsg(
          "Your database access is currently restricted. Please wait for the deployment to finish or try again later.",
        );
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filteredData,
    currentData,
    exportCSV,
    exportPDF
  } = useDataTable<PRDDocument>({
    data: prds,
    searchFields: ["projectName", "description", "projectType", "framework"],
    filterField: "projectType",
    initialPageSize: 10
  });

  const isAllCurrentSelected = currentData.length > 0 && currentData.every((prd) => selectedIds.includes(prd.id));
  const isSomeCurrentSelected = currentData.length > 0 && currentData.some((prd) => selectedIds.includes(prd.id)) && !isAllCurrentSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds((prev) => {
        const unique = new Set([...prev, ...currentData.map((prd) => prd.id)]);
        return Array.from(unique);
      });
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentData.map((prd) => prd.id).includes(id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModalState.type === "single" && deleteModalState.idToDelete) {
        await deleteDoc(doc(db, "prds", deleteModalState.idToDelete));
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModalState.idToDelete));
        showToast(t("library.prdDeletedSingle", { name: deleteModalState.nameToDelete || "" }));
      } else if (deleteModalState.type === "bulk" && selectedIds.length > 0) {
        const count = selectedIds.length;
        await Promise.all(
          selectedIds.map((id) => deleteDoc(doc(db, "prds", id))),
        );
        setSelectedIds([]);
        showToast(t("library.prdDeletedBulk", { count }));
      }
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting documents:", error);
      showToast(t("library.deleteFailed"), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModalSingle = (id: string, name: string) => {
    setDeleteModalState({ isOpen: true, type: "single", idToDelete: id, nameToDelete: name });
  };

  const openDeleteModalBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModalState({ isOpen: true, type: "bulk", idToDelete: null, nameToDelete: null });
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteModalState({ isOpen: false, type: null, idToDelete: null, nameToDelete: null });
  };

  const handleEdit = (prd: PRDDocument) => {
    setFormData({
      projectName: prd.projectName || "",
      projectType: prd.projectType || "",
      framework: prd.framework || "",
      description: prd.description || "",
    });
    setEditingId(prd.id);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await updateDoc(doc(db, "prds", editingId), {
        projectName: formData.projectName,
        projectType: formData.projectType,
        framework: formData.framework,
        description: formData.description,
      });
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating PRD:", error);
      alert("Failed to update PRD document.");
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {t("library.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("library.subtitle")}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <DataTableControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCount={selectedIds.length}
          onBulkDelete={openDeleteModalBulk}
          onClearSelection={() => setSelectedIds([])}
          isDeleting={isDeleting}
          onExportCSV={() => exportCSV('Library_PRD', [
            { header: "Project Name", key: "projectName" },
            { header: "Description", key: "description" },
            { header: "Type", key: "projectType" },
            { header: "Framework", key: "framework" },
            { header: "Created At", key: (prd) => prd.createdAt ? new Date(prd.createdAt.seconds * 1000).toLocaleDateString() : "Draft" }
          ])}
          onExportPDF={() => exportPDF('library-content', 'Library_PRD')}
          searchPlaceholder={t("library.searchPlaceholder")}
          filterComponent={
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="h-10 w-full sm:w-48 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"
            >
              <option value="all">{t("common.all")} {t("generateWizard.projectType")}</option>
              <option value="SaaS Platform">SaaS Platform</option>
              <option value="Mobile App">Mobile App</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Internal Tool">Internal Tool</option>
            </select>
          }
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            {t("common.loading")}
          </div>
        ) : errorMsg ? (
          <div className="p-12 text-center">
            <div className="inline-flex rounded-full bg-red-100 p-3 mb-4">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {t("library.unableToLoad")}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto mb-6">
              {errorMsg}
            </p>
          </div>
        ) : prds.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t("library.noPRDsYet")}
            </h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">
              {t("library.createFirstPRDDesc")}
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              {t("sidebar.generatePRD")}
            </Link>
          </div>
        ) : (
          <div id="library-content">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between" data-html2canvas-ignore="true">
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="select-all"
                    name="select-all"
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
                </div>
                <label
                  htmlFor="select-all"
                  className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer select-none"
                >
                  {selectedIds.length > 0 ? t("common.itemsSelected", { count: selectedIds.length }) : t("users.selectAll")}
                </label>
              </div>
            </div>
            <ul role="list" className="divide-y divide-gray-100">
              {currentData.map((prd) => (
                <li
                  key={prd.id}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-5 hover:bg-gray-50 sm:px-6 transition-colors ${selectedIds.includes(prd.id) ? "bg-indigo-50/30" : ""}`}
                >
                  <div className="flex min-w-0 gap-3 items-center w-full">
                    <div className="relative z-20 flex items-center justify-center h-10 w-10 sm:h-auto sm:w-auto shrink-0" onClick={(e) => e.stopPropagation()} data-html2canvas-ignore="true">
                      <input
                        type="checkbox"
                        className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 cursor-pointer text-indigo-600 focus:ring-indigo-600"
                        checked={selectedIds.includes(prd.id)}
                        onChange={() => handleSelectOne(prd.id)}
                      />
                    </div>
                    <div className="bg-indigo-50 p-2.5 rounded-lg shrink-0">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-auto relative">
                      <Link to={`/library/${prd.id}`} className="absolute inset-0 z-10" />
                      <p className="text-sm font-bold leading-6 text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {prd.projectName || "Untitled Project"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500 truncate max-w-sm relative z-0">
                        {prd.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:shrink-0 items-center justify-between sm:justify-end gap-x-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    <div className="flex flex-col sm:items-end z-10 pointer-events-none relative text-left sm:text-right">
                      <p className="text-xs font-semibold leading-5 text-gray-900">
                        {prd.projectType || "Standard"}
                      </p>
                      {prd.createdAt ? (
                        <p className="mt-0.5 text-[11px] leading-4 text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(
                            prd.createdAt.seconds * 1000,
                          ).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[11px] leading-4 text-gray-400">
                          {t("library.statusDraft")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 z-20 relative" data-html2canvas-ignore="true">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(prd); }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all border border-transparent hover:border-indigo-100 bg-gray-50 sm:bg-transparent"
                        title={t("common.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDeleteModalSingle(prd.id, prd.projectName); }}
                        className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all border border-transparent hover:border-red-100 bg-gray-50 sm:bg-transparent"
                        title={t("library.deletePRD")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/library/${prd.id}`}
                        className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all bg-gray-50 sm:bg-transparent"
                        title={t("library.viewPRD")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {currentData.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">
                {t("common.noData")}
              </div>
            )}
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              {t("users.confirmDeleteTitle")}
            </h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              {deleteModalState.type === "single" 
                ? t("users.confirmDeleteSingle", { name: deleteModalState.nameToDelete || "" }) 
                : t("users.confirmDeleteBulk", { count: selectedIds.length })}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <h2 className="text-lg font-semibold">
                {t("library.editPRDInfo")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleUpdate}
              className="p-4 space-y-4 overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("generateWizard.projectName")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("generateWizard.projectType")}
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="SaaS Platform">SaaS Platform</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Internal Tool">Internal Tool</option>
                  <option value="AI Solution">AI Solution</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("library.techStackLabel")}
                </label>
                <input
                  type="text"
                  value={formData.framework}
                  onChange={(e) =>
                    setFormData({ ...formData, framework: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("generateWizard.problemStatement")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[110] flex items-center gap-3 bg-white text-slate-800 px-5 py-3.5 rounded-2xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
          <span className="text-sm font-semibold tracking-wide text-slate-800">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

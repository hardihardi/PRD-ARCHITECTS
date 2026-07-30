import React, { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useDataTable } from "../hooks/useDataTable";
import { DataTableControls, Pagination } from "../components/DataTableControls";
import { useTranslation } from "../contexts/LanguageContext";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
  photoURL?: string;
  lastLogin?: any;
}

export function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Viewer",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Bulk selection and delete states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: "single" | "bulk" | null;
    idToDelete: string | null;
    nameToDelete: string | null;
  }>({ isOpen: false, type: null, idToDelete: null, nameToDelete: null });

  useEffect(() => {
    const q = query(collection(db, "app_users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: UserData[] = [];
        snapshot.forEach((snapDoc) => {
          data.push({ id: snapDoc.id, ...snapDoc.data() } as UserData);
        });
        setUsers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
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
  } = useDataTable<UserData>({
    data: users,
    searchFields: ["name", "email", "role"],
    filterField: "role",
    initialPageSize: 10
  });

  const isAllCurrentSelected = currentData.length > 0 && currentData.every((user) => selectedIds.includes(user.id));
  const isSomeCurrentSelected = currentData.length > 0 && currentData.some((user) => selectedIds.includes(user.id)) && !isAllCurrentSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds((prev) => {
        const unique = new Set([...prev, ...currentData.map((user) => user.id)]);
        return Array.from(unique);
      });
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentData.map((user) => user.id).includes(id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, "app_users", editingId), {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });
        await addDoc(collection(db, "logs"), {
          action: "Updated user",
          details: `Updated user details for ${formData.email}`,
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "app_users"), {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "logs"), {
          action: "Created user",
          details: `Added new user ${formData.email}`,
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      setFormData({ name: "", email: "", role: "Viewer" });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving user:", error);
      alert(t("users.saveFailed"));
    }
  };

  const handleEdit = (user: UserData) => {
    setFormData({ name: user.name, email: user.email, role: user.role });
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModalState.type === "single" && deleteModalState.idToDelete) {
        await deleteDoc(doc(db, "app_users", deleteModalState.idToDelete));
        await addDoc(collection(db, "logs"), {
          action: "Deleted user",
          details: `Deleted user ${deleteModalState.nameToDelete}`,
          createdAt: serverTimestamp(),
        });
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModalState.idToDelete));
        showToast(t("users.userDeletedSuccess", { name: deleteModalState.nameToDelete }));
      } else if (deleteModalState.type === "bulk" && selectedIds.length > 0) {
        const count = selectedIds.length;
        await Promise.all(
          selectedIds.map(async (id) => {
            const userRef = doc(db, "app_users", id);
            await deleteDoc(userRef);
          })
        );
        await addDoc(collection(db, "logs"), {
          action: "Deleted multiple users",
          details: `Deleted ${selectedIds.length} users in bulk`,
          createdAt: serverTimestamp(),
        });
        setSelectedIds([]);
        showToast(t("users.bulkDeletedSuccess", { count }));
      }
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting:", error);
      showToast(t("users.deleteFailed"), "error");
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

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {t("users.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("users.subtitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setFormData({ name: "", email: "", role: "Viewer" });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {t("users.addUser")}
          </button>
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
          onExportCSV={() => exportCSV('Data_Pengguna', [
            { header: t("users.colUser"), key: "name" },
            { header: "Email", key: "email" },
            { header: t("users.colRole"), key: "role" },
            { header: t("users.colJoined"), key: (u) => u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : "" }
          ])}
          onExportPDF={() => exportPDF('user-table-content', 'Data_Pengguna')}
          searchPlaceholder={t("users.searchPlaceholder")}
          filterComponent={
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="h-10 w-full sm:w-40 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"
            >
              <option value="all">{t("users.allRoles")}</option>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          }
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="w-full">
            <div id="user-table-content">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left w-10 text-xs font-medium text-gray-500 tracking-wider"
                        data-html2canvas-ignore="true"
                      >
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
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t("users.colUser")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t("users.colRole")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t("users.colLastLogin")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t("users.colJoined")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        data-html2canvas-ignore="true"
                      >
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.map((user) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(user.id) ? 'bg-indigo-50/20' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap" data-html2canvas-ignore="true">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 cursor-pointer text-indigo-600 focus:ring-indigo-600"
                            checked={selectedIds.includes(user.id)}
                            onChange={() => handleSelectOne(user.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                alt={user.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "Admin" ? "bg-indigo-100 text-indigo-800" : "bg-green-100 text-green-800"}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin
                            ? new Date(
                                user.lastLogin.seconds * 1000,
                              ).toLocaleString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt
                            ? new Date(
                                user.createdAt.seconds * 1000,
                              ).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" data-html2canvas-ignore="true">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
                            className="text-indigo-600 hover:text-indigo-900 mr-2 bg-indigo-50 p-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100 cursor-pointer"
                            title={t("users.editUser")}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openDeleteModalSingle(user.id, user.email); }}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                            title={t("users.deleteUser")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-100">
                <div className="bg-gray-50 px-4 py-3 flex items-center border-b border-gray-100" data-html2canvas-ignore="true">
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
                    {t("users.selectAll")} ({t("common.selectedCount", { count: selectedIds.length })})
                  </label>
                </div>
                {currentData.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 space-y-4 hover:bg-gray-50 transition-colors ${selectedIds.includes(user.id) ? 'bg-indigo-50/20' : ''}`}
                    onClick={() => handleSelectOne(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div data-html2canvas-ignore="true" onClick={(e) => e.stopPropagation()} className="p-1">
                          <input
                            type="checkbox"
                            role="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                            checked={selectedIds.includes(user.id)}
                            onChange={() => handleSelectOne(user.id)}
                          />
                        </div>
                        <img
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-gray-200"
                          src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.name}
                        />
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {user.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1">{user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full shrink-0 ${user.role === "Admin" ? "bg-indigo-100 text-indigo-800" : "bg-green-100 text-green-800"}`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-gray-100 mt-2">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{t("users.colJoined")}:</span>{" "}
                          {user.createdAt
                            ? new Date(
                                user.createdAt.seconds * 1000,
                              ).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </div>
                        <div className="text-[11px] text-gray-400">
                           <span className="font-medium text-gray-500">Online:</span>{" "}
                           {user.lastLogin 
                              ? new Date(user.lastLogin.seconds * 1000).toLocaleString(undefined, {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "-"
                           }
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0" data-html2canvas-ignore="true" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors border border-indigo-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModalSingle(user.id, user.email)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors border border-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {currentData.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                {t("users.noMatchingUsers")}
              </div>
            ) : (
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
          <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
              <UsersIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("users.emptyStateTitle")}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {t("users.emptyStateDesc")}
            </p>
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
                ? t("users.confirmDeleteSingle", { name: deleteModalState.nameToDelete }) 
                : t("users.confirmDeleteBulk", { count: selectedIds.length })}
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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

      {/* Insert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <h2 className="text-lg font-semibold">
                {editingId ? t("users.editUserTitle") : t("users.addUserTitle")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-4 space-y-4 overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.fullNameLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.colRole")}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
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


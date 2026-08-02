import React, { useState, useEffect } from "react";
import {
  Globe,
  Palette,
  Image as ImageIcon,
  Compass,
  FileText,
  Clock,
  ExternalLink,
  Trash2,
  Pencil,
  Eye,
  X,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Code,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Search,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  setDoc
} from "firebase/firestore";
import { useDataTable } from "../hooks/useDataTable";
import { DataTableControls, Pagination } from "../components/DataTableControls";
import { useTranslation } from "../contexts/LanguageContext";

export interface ExtractorHistoryItem {
  id: string;
  url: string;
  domain: string;
  type: "styleguide" | "images" | "crawl";
  timestamp: string;
  formattedDate?: string;
  title: string;
  summary: string;
  data: any;
  metrics?: {
    colorCount?: number;
    imageCount?: number;
    pagesCount?: number;
    seoScore?: number;
  };
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

const LOCAL_STORAGE_KEY = "web_extractor_history_v1";

const DEFAULT_SAMPLE_DATA: ExtractorHistoryItem[] = [
  {
    id: "hist-demo-1",
    url: "https://stripe.com",
    domain: "stripe.com",
    type: "styleguide",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    formattedDate: "Today, 20:05",
    title: "Stripe Design System & Color Palette",
    summary: "Ekstraksi 12 warna utama, tipografi Graphik, dan token Tailwind CSS.",
    metrics: { colorCount: 12 },
    data: {
      brandName: "Stripe",
      domain: "stripe.com",
      tagline: "Financial infrastructure for the internet",
      primaryColors: [
        { name: "Stripe Blurple", hex: "#635BFF", usage: "Primary Action", rgb: "rgb(99, 91, 255)" },
        { name: "Slate Dark", hex: "#0A2540", usage: "Headings & Surface", rgb: "rgb(10, 37, 64)" },
        { name: "Cyan Spark", hex: "#00D4FF", usage: "Highlights", rgb: "rgb(0, 212, 255)" },
      ],
      secondaryColors: [
        { name: "Emerald Success", hex: "#00D924", usage: "Success State" },
        { name: "Amber Warning", hex: "#FFC700", usage: "Warning State" },
      ],
      neutralColors: [
        { name: "Canvas Light", hex: "#F6F9FC", usage: "Background" },
        { name: "Border Neutral", hex: "#E6EBF1", usage: "Card Borders" },
      ],
      typography: {
        fontFamilyHeading: "Graphik, -apple-system, sans-serif",
        fontFamilyBody: "Inter, sans-serif",
        scale: [
          { level: "Display Title", size: "48px", weight: "700", lineHeight: "1.1" },
          { level: "Heading 1", size: "32px", weight: "600", lineHeight: "1.2" },
          { level: "Body Regular", size: "16px", weight: "400", lineHeight: "1.5" },
        ],
      },
      components: {
        buttons: [
          { variant: "Primary Solid", bg: "#635BFF", text: "#FFFFFF", radius: "20px", padding: "10px 20px" },
        ],
        cards: { borderRadius: "16px", padding: "24px" },
      },
      tailwindConfig: `// Tailwind CSS Config for Stripe
module.exports = {
  theme: {
    extend: {
      colors: {
        stripe: {
          blurple: '#635BFF',
          dark: '#0A2540',
          cyan: '#00D4FF',
        }
      }
    }
  }
}`
    },
  },
  {
    id: "hist-demo-2",
    url: "https://github.com",
    domain: "github.com",
    type: "images",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    formattedDate: "Today, 18:00",
    title: "GitHub Brand & Octocat Assets",
    summary: "18 media assets dikikis termasuk logo, hero banner, dan icon UI.",
    metrics: { imageCount: 18 },
    data: {
      domain: "github.com",
      images: [
        {
          id: "img-1",
          url: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
          alt: "GitHub Mark Logo",
          category: "Logo",
          type: "PNG",
          dimensions: "512x512",
          fileSize: "14.2 KB",
          description: "Official GitHub Octocat Logo Icon",
        },
        {
          id: "img-2",
          url: "https://github.githubassets.com/assets/hero-desktop-1b3c3b.png",
          alt: "GitHub Copilot Hero Banner",
          category: "Hero Banner",
          type: "PNG",
          dimensions: "1920x1080",
          fileSize: "245 KB",
          description: "Copilot workspace background banner",
        },
        {
          id: "img-3",
          url: "https://github.githubassets.com/assets/code-icon-4a1122.png",
          alt: "Code Repository Icon",
          category: "Icon",
          type: "SVG",
          dimensions: "Vector",
          fileSize: "2.1 KB",
          description: "Repository navigation vector asset",
        },
      ],
    },
  },
  {
    id: "hist-demo-3",
    url: "https://linear.app",
    domain: "linear.app",
    type: "crawl",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    formattedDate: "Yesterday, 14:20",
    title: "Linear App Site Topology & SEO Report",
    summary: "Rangkuman 8 rute halaman utama, SEO Health score 94/100, Next.js tech stack.",
    metrics: { pagesCount: 8, seoScore: 94 },
    data: {
      domain: "linear.app",
      url: "https://linear.app",
      crawlSummary: {
        pageTitle: "Linear – Purpose-built tool for modern product teams",
        metaDescription: "Linear streamlines software projects, sprints, tasks, and bug tracking with high speed.",
        seoHealthScore: 94,
        discoveredPagesCount: 8,
        serverHeader: "Cloudflare Vercel Edge",
        techStack: ["Next.js 15", "React 19", "Tailwind CSS", "Framer Motion", "GraphQL"],
      },
      siteHierarchy: [
        { path: "/", title: "Linear Home", type: "Landing Page", status: "200 OK", summary: "Halaman utama perkenalan produk & fitur unggulan." },
        { path: "/features", title: "Product Features", type: "Feature Directory", status: "200 OK", summary: "Penjelasan detail Issue tracking, Cycles, dan Roadmap." },
        { path: "/integrations", title: "Integrations Hub", type: "Directory", status: "200 OK", summary: "Koneksi ke GitHub, Slack, Figma, dan Sentry." },
        { path: "/pricing", title: "Pricing Plans", type: "Commercial", status: "200 OK", summary: "Tabel harga Free, Standard, Plus, Enterprise." },
      ],
      detectedEndpoints: [
        { path: "/api/v1/graphql", type: "GraphQL API", method: "POST" },
        { path: "/api/auth/session", type: "Authentication", method: "GET" },
      ],
    },
  },
];

export function LibraryExtractor() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ExtractorHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtractorHistoryItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    domain: "",
    url: "",
    summary: "",
  });

  // Detail Modal State
  const [detailItem, setDetailItem] = useState<ExtractorHistoryItem | null>(null);
  const [detailTab, setDetailTab] = useState<string>("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: "single" | "bulk" | null;
    idToDelete: string | null;
    nameToDelete: string | null;
  }>({ isOpen: false, type: null, idToDelete: null, nameToDelete: null });

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Synchronize from LocalStorage & Firestore
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    // First load local storage for instant responsiveness
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn("LocalStorage load error:", e);
    }

    // Subscribe to Firestore for real-time cloud data
    try {
      const q = query(collection(db, "extractor_history"), orderBy("createdAt", "desc"));
      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreDocs = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })) as ExtractorHistoryItem[];
            setItems(firestoreDocs);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(firestoreDocs));
          } else {
            // Fallback to sample data if database is empty
            const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!savedLocal || JSON.parse(savedLocal).length === 0) {
              setItems(DEFAULT_SAMPLE_DATA);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_DATA));
            }
          }
          setLoading(false);
        },
        (error) => {
          console.warn("Firestore listener error, using local state:", error);
          const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (!savedLocal || JSON.parse(savedLocal).length === 0) {
            setItems(DEFAULT_SAMPLE_DATA);
          }
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn("Firestore setup error:", err);
      setLoading(false);
    }

    return () => unsubscribeFirestore();
  }, []);

  // Save changes to state, localStorage, and Firestore helper
  const updateItemsState = async (newItems: ExtractorHistoryItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error("Failed to save local history:", e);
    }
  };

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
  } = useDataTable<ExtractorHistoryItem>({
    data: items,
    searchFields: ["title", "domain", "url", "summary"],
    filterField: "type",
    initialPageSize: 10
  });

  const isAllCurrentSelected = currentData.length > 0 && currentData.every((item) => selectedIds.includes(item.id));
  const isSomeCurrentSelected = currentData.length > 0 && currentData.some((item) => selectedIds.includes(item.id)) && !isAllCurrentSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds((prev) => {
        const unique = new Set([...prev, ...currentData.map((item) => item.id)]);
        return Array.from(unique);
      });
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentData.map((item) => item.id).includes(id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete Confirm Action
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModalState.type === "single" && deleteModalState.idToDelete) {
        const targetId = deleteModalState.idToDelete;
        const newItems = items.filter((item) => item.id !== targetId);
        await updateItemsState(newItems);

        // Delete from Firestore if exists
        try {
          await deleteDoc(doc(db, "extractor_history", targetId));
        } catch (e) {
          // ignore error if doc only existed locally
        }

        setSelectedIds((prev) => prev.filter((id) => id !== targetId));
        showToast(t("libraryExtractor.deletedSingle", { name: deleteModalState.nameToDelete || "" }));
      } else if (deleteModalState.type === "bulk" && selectedIds.length > 0) {
        const count = selectedIds.length;
        const newItems = items.filter((item) => !selectedIds.includes(item.id));
        await updateItemsState(newItems);

        // Delete from Firestore
        await Promise.all(
          selectedIds.map(async (id) => {
            try {
              await deleteDoc(doc(db, "extractor_history", id));
            } catch (e) {
              // ignore
            }
          })
        );

        setSelectedIds([]);
        showToast(t("libraryExtractor.deletedBulk", { count }));
      }
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting extraction history:", error);
      showToast(t("libraryExtractor.deleteFailed"), "error");
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

  // Edit Handlers
  const handleOpenEdit = (item: ExtractorHistoryItem) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title || "",
      domain: item.domain || "",
      url: item.url || "",
      summary: item.summary || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const updatedItem: ExtractorHistoryItem = {
        ...editingItem,
        title: editFormData.title,
        domain: editFormData.domain,
        url: editFormData.url,
        summary: editFormData.summary,
      };

      const newItems = items.map((i) => (i.id === editingItem.id ? updatedItem : i));
      await updateItemsState(newItems);

      // Try updating in Firestore
      try {
        await updateDoc(doc(db, "extractor_history", editingItem.id), {
          title: editFormData.title,
          domain: editFormData.domain,
          url: editFormData.url,
          summary: editFormData.summary,
        });
      } catch (err) {
        // If not in firestore, attempt setDoc
        try {
          await setDoc(doc(db, "extractor_history", editingItem.id), updatedItem, { merge: true });
        } catch (e) {
          // ignore if offline
        }
      }

      setIsEditModalOpen(false);
      setEditingItem(null);
      showToast(t("libraryExtractor.updateSuccess"));
    } catch (err) {
      console.error("Error updating item:", err);
      showToast(t("libraryExtractor.updateFailed"), "error");
    }
  };

  // Copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Category Icon & Badge renderer
  const renderCategoryBadge = (type: "styleguide" | "images" | "crawl") => {
    switch (type) {
      case "styleguide":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Palette className="w-3.5 h-3.5 mr-1" />
            {t("libraryExtractor.typeStyleguide")}
          </span>
        );
      case "images":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ImageIcon className="w-3.5 h-3.5 mr-1" />
            {t("libraryExtractor.typeImages")}
          </span>
        );
      case "crawl":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Compass className="w-3.5 h-3.5 mr-1" />
            {t("libraryExtractor.typeCrawl")}
          </span>
        );
      default:
        return null;
    }
  };

  const getMetricsDisplay = (item: ExtractorHistoryItem) => {
    if (item.type === "styleguide") {
      const colorCount = item.metrics?.colorCount || item.data?.primaryColors?.length || 0;
      return `${colorCount} Warna Token`;
    }
    if (item.type === "images") {
      const count = item.metrics?.imageCount || item.data?.images?.length || 0;
      return `${count} Media Asset`;
    }
    if (item.type === "crawl") {
      const pageCount = item.metrics?.pagesCount || item.data?.siteHierarchy?.length || 0;
      const score = item.metrics?.seoScore || item.data?.crawlSummary?.seoHealthScore || 90;
      return `${pageCount} Halaman • SEO ${score}/100`;
    }
    return "-";
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[120] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-top duration-300 ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {t("libraryExtractor.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("libraryExtractor.subtitle")}
          </p>
        </div>
        <Link
          to="/web-extractor"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95 shrink-0"
        >
          <Globe className="h-4 w-4" />
          <span>{t("libraryExtractor.goToExtractor")}</span>
        </Link>
      </div>

      {/* Control Bar (Search, Filter, Export PDF & CSV, Bulk Delete Trigger) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <DataTableControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCount={selectedIds.length}
          onBulkDelete={openDeleteModalBulk}
          onClearSelection={() => setSelectedIds([])}
          isDeleting={isDeleting}
          onExportCSV={() =>
            exportCSV("Library_Web_Extractor", [
              { header: "Title", key: "title" },
              { header: "Domain", key: "domain" },
              { header: "URL", key: "url" },
              { header: "Type", key: "type" },
              { header: "Summary", key: "summary" },
              {
                header: "Date",
                key: (item) =>
                  item.formattedDate ||
                  (item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "-"),
              },
            ])
          }
          onExportPDF={() => exportPDF("library-extractor-content", "Library_Web_Extractor")}
          searchPlaceholder={t("libraryExtractor.searchPlaceholder")}
          filterComponent={
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="h-10 w-full sm:w-56 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"
            >
              <option value="all">{t("libraryExtractor.allTypes")}</option>
              <option value="styleguide">{t("libraryExtractor.typeStyleguide")}</option>
              <option value="images">{t("libraryExtractor.typeImages")}</option>
              <option value="crawl">{t("libraryExtractor.typeCrawl")}</option>
            </select>
          }
        />
      </div>

      {/* Main Table / Data List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            {t("common.loading")}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t("libraryExtractor.noExtractionsYet")}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto mb-6">
              {t("libraryExtractor.noExtractionsDesc")}
            </p>
            <Link
              to="/web-extractor"
              className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
            >
              {t("libraryExtractor.goToExtractor")}
            </Link>
          </div>
        ) : (
          <div id="library-extractor-content">
            {/* Header select bar */}
            <div
              className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between"
              data-html2canvas-ignore="true"
            >
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="select-all-extractor"
                    name="select-all-extractor"
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
                  htmlFor="select-all-extractor"
                  className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer select-none"
                >
                  {selectedIds.length > 0
                    ? t("common.itemsSelected", { count: selectedIds.length })
                    : t("users.selectAll")}
                </label>
              </div>
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                {t("datatable.totalItems", { count: filteredData.length })}
              </span>
            </div>

            {/* List Rows */}
            <ul role="list" className="divide-y divide-gray-100">
              {currentData.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <li
                    key={item.id}
                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-5 hover:bg-gray-50 sm:px-6 transition-colors ${
                      isSelected ? "bg-indigo-50/30" : ""
                    }`}
                  >
                    <div className="flex min-w-0 gap-3 items-center w-full">
                      {/* Selection Checkbox */}
                      <div
                        className="relative z-20 flex items-center justify-center h-10 w-10 sm:h-auto sm:w-auto shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        data-html2canvas-ignore="true"
                      >
                        <input
                          type="checkbox"
                          className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 cursor-pointer text-indigo-600 focus:ring-indigo-600"
                          checked={isSelected}
                          onChange={() => handleSelectOne(item.id)}
                        />
                      </div>

                      {/* Icon Avatar */}
                      <div className="p-2.5 rounded-xl shrink-0 bg-indigo-50 text-indigo-600">
                        {item.type === "styleguide" && <Palette className="h-6 w-6" />}
                        {item.type === "images" && <ImageIcon className="h-6 w-6 text-blue-600" />}
                        {item.type === "crawl" && <Compass className="h-6 w-6 text-emerald-600" />}
                      </div>

                      {/* Info & Title */}
                      <div className="min-w-0 flex-auto relative">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setDetailItem(item);
                              setDetailTab("overview");
                            }}
                            className="text-left font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors truncate hover:underline"
                          >
                            {item.title || item.domain}
                          </button>
                          {renderCategoryBadge(item.type)}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 truncate max-w-lg">
                          <span className="font-semibold text-gray-700 mr-1.5">{item.domain}</span>
                          — {item.summary || item.url}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex sm:shrink-0 items-center justify-between sm:justify-end gap-x-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <div className="flex flex-col sm:items-end z-10 pointer-events-none relative text-left sm:text-right">
                        <p className="text-xs font-semibold leading-5 text-gray-900">
                          {getMetricsDisplay(item)}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.formattedDate ||
                            (item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "Saved")}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div
                        className="flex gap-1.5 z-20 relative"
                        data-html2canvas-ignore="true"
                      >
                        {/* Detail / Eye Button */}
                        <button
                          onClick={() => {
                            setDetailItem(item);
                            setDetailTab("overview");
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all border border-transparent hover:border-gray-200 bg-gray-50 sm:bg-transparent"
                          title={t("libraryExtractor.viewDetail")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit Pencil Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all border border-transparent hover:border-indigo-100 bg-gray-50 sm:bg-transparent"
                          title={t("common.edit")}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteModalSingle(item.id, item.title || item.domain)}
                          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all border border-transparent hover:border-red-100 bg-gray-50 sm:bg-transparent"
                          title={t("common.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
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

      {/* EDIT MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {t("libraryExtractor.editTitle")}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t("libraryExtractor.editSubtitle")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  {t("libraryExtractor.fieldTitle")}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  {t("libraryExtractor.fieldDomain")}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.domain}
                  onChange={(e) => setEditFormData({ ...editFormData, domain: e.target.value })}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  {t("libraryExtractor.fieldUrl")}
                </label>
                <input
                  type="url"
                  required
                  value={editFormData.url}
                  onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  {t("libraryExtractor.fieldSummary")}
                </label>
                <textarea
                  rows={3}
                  value={editFormData.summary}
                  onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                  className="w-full p-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-sm"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                  {detailItem.type === "styleguide" && <Palette className="h-6 w-6" />}
                  {detailItem.type === "images" && <ImageIcon className="h-6 w-6 text-blue-600" />}
                  {detailItem.type === "crawl" && <Compass className="h-6 w-6 text-emerald-600" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {detailItem.title || detailItem.domain}
                    </h3>
                    {renderCategoryBadge(detailItem.type)}
                  </div>
                  <a
                    href={detailItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>{detailItem.url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-700">
              {/* Summary card */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block mb-1">
                    Ringkasan Hasil Ekstraksi
                  </span>
                  <p className="text-sm text-gray-800 font-medium">
                    {detailItem.summary || "Tidak ada catatan kustom."}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-500 block">Tanggal Ekstraksi</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {detailItem.formattedDate ||
                      (detailItem.timestamp ? new Date(detailItem.timestamp).toLocaleString() : "-")}
                  </span>
                </div>
              </div>

              {/* DETAILS FOR STYLE GUIDE */}
              {detailItem.type === "styleguide" && (
                <div className="space-y-6">
                  {/* Colors Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-purple-600" />
                      <span>Palette Warna Utama (Color Tokens)</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(detailItem.data?.primaryColors || []).concat(detailItem.data?.secondaryColors || []).map(
                        (col: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-8 w-8 rounded-lg shadow-inner border border-black/10 shrink-0"
                                style={{ backgroundColor: col.hex }}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {col.name || `Color ${idx + 1}`}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">{col.usage || "Token"}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                              <code className="text-xs font-mono font-bold text-gray-800">{col.hex}</code>
                              <button
                                onClick={() => handleCopyText(col.hex, `color-${idx}`)}
                                className="p-1 text-gray-400 hover:text-indigo-600 rounded transition"
                                title="Copy HEX"
                              >
                                {copiedKey === `color-${idx}` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Typography Section */}
                  {detailItem.data?.typography && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <span>Hirarki Tipografi (Typography Specs)</span>
                      </h4>
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500 block">Font Heading:</span>
                            <span className="font-semibold text-gray-900 font-mono">
                              {detailItem.data.typography.fontFamilyHeading || "Sans-serif"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Font Body:</span>
                            <span className="font-semibold text-gray-900 font-mono">
                              {detailItem.data.typography.fontFamilyBody || "Inter"}
                            </span>
                          </div>
                        </div>

                        {detailItem.data.typography.scale && (
                          <div className="pt-2 border-t border-gray-200 space-y-2">
                            {detailItem.data.typography.scale.map((s: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-gray-100"
                              >
                                <span className="font-medium text-gray-700">{s.level}</span>
                                <div className="flex items-center gap-3 font-mono text-gray-600">
                                  <span>{s.size}</span>
                                  <span>wt: {s.weight}</span>
                                  <span>lh: {s.lineHeight}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tailwind Config Code */}
                  {detailItem.data?.tailwindConfig && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Code className="h-4 w-4 text-indigo-600" />
                          <span>Tailwind CSS Configuration Token</span>
                        </h4>
                        <button
                          onClick={() => handleCopyText(detailItem.data.tailwindConfig, "tw-code")}
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          {copiedKey === "tw-code" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedKey === "tw-code" ? t("libraryExtractor.copySuccess") : "Copy Config"}</span>
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                        {detailItem.data.tailwindConfig}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* DETAILS FOR IMAGES */}
              {detailItem.type === "images" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span>Galeri Media Asset ({detailItem.data?.images?.length || 0})</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(detailItem.data?.images || []).map((img: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between space-y-2 group"
                      >
                        <div className="h-36 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                          <img
                            src={img.url}
                            alt={img.alt || "Extracted asset"}
                            className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {img.alt || img.category || `Asset #${idx + 1}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {img.type || "PNG"}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {img.dimensions || img.fileSize || "Original"}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            onClick={() => handleCopyText(img.url, `img-url-${idx}`)}
                            className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                            title="Copy image link"
                          >
                            {copiedKey === `img-url-${idx}` ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DETAILS FOR CRAWL / SEO */}
              {detailItem.type === "crawl" && (
                <div className="space-y-6">
                  {/* SEO Overview */}
                  {detailItem.data?.crawlSummary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-center items-center text-center">
                        <span className="text-3xl font-extrabold text-emerald-600">
                          {detailItem.data.crawlSummary.seoHealthScore || 90}/100
                        </span>
                        <span className="text-xs font-semibold text-emerald-800 mt-1">SEO Health Score</span>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-center">
                        <span className="text-xs text-gray-500">Page Title</span>
                        <p className="text-xs font-bold text-gray-900 line-clamp-2 mt-0.5">
                          {detailItem.data.crawlSummary.pageTitle || detailItem.domain}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-center">
                        <span className="text-xs text-gray-500">Tech Stack Discovered</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(detailItem.data.crawlSummary.techStack || ["React", "Next.js"]).map(
                            (tech: string, i: number) => (
                              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                {tech}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Site Hierarchy */}
                  {detailItem.data?.siteHierarchy && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Compass className="h-4 w-4 text-emerald-600" />
                        <span>Struktur Site Hierarchy ({detailItem.data.siteHierarchy.length} Routes)</span>
                      </h4>
                      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                        {detailItem.data.siteHierarchy.map((route: any, idx: number) => (
                          <div key={idx} className="p-3.5 hover:bg-gray-50 flex items-start justify-between gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                  {route.path}
                                </span>
                                <span className="font-semibold text-gray-900">{route.title}</span>
                              </div>
                              <p className="mt-1 text-gray-500">{route.summary}</p>
                            </div>
                            <span className="shrink-0 font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                              {route.status || "200 OK"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setDetailItem(null)}
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
              >
                {t("libraryDesign.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (SINGLE / BULK) */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {deleteModalState.type === "bulk"
                ? t("libraryExtractor.confirmDeleteBulkTitle")
                : t("libraryExtractor.confirmDeleteSingleTitle")}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {deleteModalState.type === "bulk"
                ? t("libraryExtractor.confirmDeleteBulkDesc", { count: selectedIds.length })
                : t("libraryExtractor.confirmDeleteSingleDesc", { name: deleteModalState.nameToDelete || "" })}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={closeDeleteModal}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 transition disabled:opacity-50"
              >
                {isDeleting ? t("users.deleting") : t("users.yesDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Server,
  Shield,
  Laptop,
  Activity,
  LayoutTemplate,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  Users,
  BookOpen,
  Truck,
  Smartphone,
  ExternalLink,
  Star,
  Award,
  Sparkles,
  Edit,
  Eye,
  X,
  Maximize2,
  Monitor
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDataTable } from "../hooks/useDataTable";
import { DataTableControls, Pagination } from "../components/DataTableControls";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/LanguageContext";

const templates = [
  {
    id: "ecommerce",
    name: "E-Commerce & Marketplace Modern",
    description:
      "Solusi komprehensif untuk platform e-commerce dan marketplace multi-vendor. Dilengkapi arsitektur keranjang belanja, checkout pembayaran yang mulus, sinkronisasi inventaris real-time, manajemen katalog, dan dashboard analitik mendalam bagi penjual.",
    features: [
      "Katalog Produk & Pencarian Algoritma",
      "Keranjang Belanja & Checkout 3-Tahap",
      "Integrasi API Payment Gateway (Multi)",
      "Dashboard Penjual (Vendor) & Admin",
      "Sistem Ulasan & Rating Pelanggan",
      "Push Notification Promo & Abandoned Cart",
    ],
    category: "Retail & E-Commerce",
    complexity: "Tinggi",
    timeEstimation: "4-6 Minggu",
    icon: ShoppingCart,
    color: "bg-blue-50 text-blue-600",
    borderColor: "border-blue-100/60",
    audience: "B2C / C2C",
    techStack: "React, Node.js, PostgreSQL",
  },
  {
    id: "saas",
    name: "SaaS & Subscription Platform Analytics",
    description:
      "Template arsitektur solid untuk aplikasi B2B Software-as-a-Service bertingkat (multi-tenant). Termasuk manajemen berlangganan (billing), kontrol akses berbasis peran (RBAC), metrik penggunaan real-time, dan alur orientasi produk (onboarding).",
    features: [
      "Manajemen Billing & Subscription",
      "Multi-tier Access (RBAC) & Tenant",
      "Dasbor Metrik & Analisis Penggunaan",
      "Siklus Kehidupan Pelanggan (Onboarding)",
      "Integrasi Webhook & API External",
      "Manajemen Keamanan (SSO/Keycloak)",
    ],
    category: "B2B Software",
    complexity: "Sangat Tinggi",
    timeEstimation: "6-8 Minggu",
    icon: Laptop,
    color: "bg-purple-50 text-purple-600",
    borderColor: "border-purple-100/60",
    audience: "Masyarakat Perusahaan (B2B)",
    techStack: "Next.js, AWS, GraphQL",
  },
  {
    id: "internal-tool",
    name: "Sistem Manajemen Admin Back-Office",
    description:
      "Cetak biru sistem kontrol internal perusahaan (ERP mini / HRMS). Berfokus pada operasi data bervolume tinggi (CRUD), otomasi alur kerja persetujuan berlapis, laporan eksekutif lengkap, log audit, dan pelacakan historis akses staf.",
    features: [
      "Manajemen Karyawan & Role Akses",
      "Tabel Dinamis dengan Filter Kompleks",
      "Export PDF/Excel & Laporan Eksekutif",
      "Workflow Persetujuan Bertingkat",
      "Log Audit & Sistem Notifikasi",
      "Integrasi Penyimpanan Dokumen Aman",
    ],
    category: "Back-office & HR",
    complexity: "Sedang",
    timeEstimation: "3-4 Minggu",
    icon: Server,
    color: "bg-amber-50 text-amber-600",
    borderColor: "border-amber-100/60",
    audience: "Manajemen & Karyawan",
    techStack: "React, Firebase, MySQL",
  },
  {
    id: "fintech",
    name: "Fintech Remitansi & Global E-Wallet",
    description:
      "Arsitektur finansial tier-1 dengan sertifikasi keamanan tinggi (PCI-DSS compliant). Menyediakan dompet digital (wallet), transfer mata uang antar-batas negara (cross-border), verifikasi e-KYC otomatis, dan pembukuan transaksi real-time.",
    features: [
      "Verifikasi Identitas e-KYC Mandiri",
      "Dompet Digital & Integrasi Saldo",
      "Transfer Lintas Negara Transparan",
      "Otentikasi MFA & Keamanan Tingkat Tinggi",
      "Riwayat Mutasi & Laporan Keuangan",
      "Push Notification & Alerts Transaksi",
    ],
    category: "Financial Services",
    complexity: "Kritis & Kompleks",
    timeEstimation: "8-12 Minggu",
    icon: Shield,
    color: "bg-emerald-50 text-emerald-600",
    borderColor: "border-emerald-100/60",
    audience: "Global User / B2C",
    techStack: "React Native, Go, gRPC",
  },
  {
    id: "healthtech",
    name: "Telemedisin & Reservasi Medis Digital",
    description:
      "Skema layanan kesehatan digital penuh rekam jejak, disesuaikan dengan kepatuhan medis. Menghubungkan staf spesialis dan pasien dengan fitur reservasi, telekonsultasi virtual (layanan video/teks), dan penerbitan resep cloud.",
    features: [
      "Penjadwalan Otomatis & Konsultasi",
      "Telekonsultasi Video & Chat Enkripsi",
      "Rekam Medis Elektronik (EMR)",
      "Penerbitan Resep Dokter & Apotek",
      "Notifikasi Janji Temu (Reminder)",
      "Integrasi Pihak Asuransi (Opsional)",
    ],
    category: "Healthcare & Medtech",
    complexity: "Tinggi",
    timeEstimation: "6-10 Minggu",
    icon: Activity,
    color: "bg-rose-50 text-rose-600",
    borderColor: "border-rose-100/60",
    audience: "Pasien & Rumah Sakit",
    techStack: "React, NestJS, Postgres",
  },
  {
    id: "crm",
    name: "CRM Omnichannel & Sales Tracking",
    description:
      "Solusi Customer Relationship Management untuk eskalasi matriks konversi. Melacak lintasan prospek, email sales terintegrasi, papan kanban drag-and-drop untuk negosiasi kesepakatan, dan dashboard estimasi pendapatan bulanan.",
    features: [
      "Sistem Lead Scoring & Pipa Penjualan",
      "Sinkronisasi Dua-Arah Email Interaksi",
      "Penjadwalan Pengingat Follow-Up",
      "Dashboard Retensi & Estimasi ROI",
      "Automasi Pemasaran & Tugas Berulang",
      "Sistem Laporan Eksekutif Bulanan",
    ],
    category: "Sales & Marketing",
    complexity: "Tinggi",
    timeEstimation: "4-7 Minggu",
    icon: Users,
    color: "bg-cyan-50 text-cyan-600",
    borderColor: "border-cyan-100/60",
    audience: "Tim B2B Sales / Eksekutif",
    techStack: "React, Node.js, Redis",
  },
  {
    id: "elearning",
    name: "LMS & E-Learning Platform Interaktif",
    description:
      "Sistem Manajemen Pembelajaran (LMS) modern untuk institusi pendidikan dan kreator kursus independen. Mendukung kelas sinkron dan asinkron, manajemen kurikulum silabus kompleks, sistem ujian dengan proctoring otomatis, penjadwalan kelas virtual terintegrasi, serta sistem sertifikasi digital dengan pelacakan analitik kemajuan siswa.",
    features: [
      "Manajemen Silabus & Modul Kursus Berjenjang",
      "Sistem Ujian Interaktif & Kuis (Auto-grade)",
      "Penerbitan Sertifikat Digital & Gamifikasi",
      "Kelas Virtual Langsung (Video Integration)",
      "Forum Diskusi & Komunitas Pembelajar",
      "Dashboard Analitik Kemajuan Belajar Siswa",
    ],
    category: "EdTech & Education",
    complexity: "Sedang-Tinggi",
    timeEstimation: "5-8 Minggu",
    icon: BookOpen,
    color: "bg-teal-50 text-teal-600",
    borderColor: "border-teal-100/60",
    audience: "Kreator Kursus, Siswa, Institusi",
    techStack: "React, Express, MongoDB, WebRTC",
  },
  {
    id: "logistics",
    name: "Logistik & Supply Chain Tracker Pro",
    description:
      "Platfom logistik pintar untuk manajemen rantai pasokan tanpa putus. Memiliki fitur pelacakan armada secara real-time via GPS, rute pengiriman yang dioptimalkan dengan Machine Learning, pengaturan jadwal gudang terintegrasi (WMS multi-node), manajemen kurir, dan otomatisasi bukti pengiriman elektronik (e-POD) dengan tanda tangan digital.",
    features: [
      "Pelacakan GPS Armada Real-Time & Rute Pintar",
      "Manajemen Inventaris Gudang (RFID/Barcode)",
      "Aplikasi Scanner Pihak Kurir (Mobile First)",
      "Bukti Pengiriman Otomatis (e-POD) & Notifikasi",
      "Manajemen Penugasan Kurir & Penetrasi Rute",
      "Perhitungan Otomatis Biaya Pengiriman Dinamis",
    ],
    category: "Logistics & Supply Chain",
    complexity: "Sangat Tinggi",
    timeEstimation: "8-12 Minggu",
    icon: Truck,
    color: "bg-orange-50 text-orange-600",
    borderColor: "border-orange-100/60",
    audience: "B2B Perusahaan Ekspedisi & Gudang",
    techStack: "React Native, Node.js, PostgreSQL, Google Maps API",
  },
  {
    id: "on-demand",
    name: "Aplikasi On-Demand Services (Super App)",
    description:
      "Klon arsitektur aplikasi Super-App yang menghubungkan pelanggan dengan penyedia jasa langsung (seperti Gojek/Grab). Mengedepankan algoritma pencocokan (matchmaking) jarak terdekat, sistem pelelangan pesanan bagi pengemudi/pekerja, estimasi harga transparan (surge pricing), komunikasi in-app chat, serta pilar keamanan keselamatan penumpang.",
    features: [
      "Algoritma Matchmaking Geolocation Realtime",
      "Penghitungan Surge Pricing Otomatis",
      "Sistem Dompet Ekosistem Tertutup (Closed-loop e-Wallet)",
      "In-App Chat & Telepon Anonim Antar Pengguna",
      "Sistem Tracking Kurir Interaktif",
      "Pusat Resolusi Konflik (Customer Support System)",
    ],
    category: "On-Demand & Mobility",
    complexity: "Kritis Ekstrim",
    timeEstimation: "12-16 Minggu",
    icon: Smartphone,
    color: "bg-pink-50 text-pink-600",
    borderColor: "border-pink-100/60",
    audience: "B2C Driver/Mitra & Pengguna Umum",
    techStack: "Flutter, Go, Redis, Kafka, Cassandra",
  },
  {
    id: "ai-copilot",
    name: "Asisten Cerdas AI & Generative Workspace",
    description:
      "Ruang kerja kolaboratif berorientasi AI (seperti Notion AI / ChatGPT). Merupakan aplikasi yang mengintegrasikan model Large Language Model (LLM) untuk generatif teks, gambar, ringkasan, atau penerjemahan ke dalam editor dokumen secara mulus. Mendukung agen otonom, alur RAG (Retrieval-Augmented Generation), dan penelusuran semantik dari basis dokumen perusahaan.",
    features: [
      "Editor Dokumen Real-Time Bergaya Blok (Block-based)",
      "Integrasi LLM Interaktif untuk Penulisan Kreatif",
      "Penelusuran Dokumen Semantik (Vector Search Database)",
      "Bot Penjawab Otomatis ke Pengetahuan Internal",
      "Draf Automatis, Ringkasan & Terjemahan",
      "Manajemen Limit Kuota API Per-Pengguna",
    ],
    category: "AI & Productivity",
    complexity: "Sedang",
    timeEstimation: "4-6 Minggu",
    icon: Zap,
    color: "bg-indigo-50 text-indigo-600",
    borderColor: "border-indigo-100/60",
    audience: "Profesional, Pekerja Kreatif, Agensi",
    techStack: "Next.js, Python FastAPI, Pinecone, OpenAI API",
  },
];

export function Templates() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [allTemplates, setAllTemplates] = useState<any[]>(templates);
  const [loading, setLoading] = useState(true);
  const [previewModalTemplate, setPreviewModalTemplate] = useState<any | null>(null);

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const communityTemplates = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            isCommunity: true,
            name: data.name,
            description: data.description,
            features: Array.isArray(data.features) ? data.features : (data.features || "").split("\n").filter(Boolean),
            category: data.category || "Community",
            complexity: data.complexity || "Bervariasi",
            timeEstimation: data.timeEstimation || "-",
            audience: data.audience || "Umum",
            techStack: data.techStack || "-",
            icon: LayoutTemplate,
            color: data.isFeatured ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-600",
            borderColor: data.isFeatured ? "border-amber-100/60" : "border-gray-200",
            authorName: data.authorName,
            isFeatured: data.isFeatured,
            rating: data.rating || 0,
            ratingCount: data.ratingCount || 0,
            createdBy: data.createdBy || null
          };
        });
        setAllTemplates([...templates, ...communityTemplates]);
      } catch (err) {
        console.warn("Gagal mengambil template komunitas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplace();
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
    totalPages,
    filteredData,
    currentData,
    exportCSV,
    exportPDF
  } = useDataTable({
    data: allTemplates,
    searchFields: ["name", "description", "category", "authorName"],
    filterField: "category",
    initialPageSize: 6
  });

  // Get unique categories for the filter
  const categories = Array.from(new Set(allTemplates.map(t => t.category)));

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {t("templates.title")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
            {t("templates.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:w-auto w-full justify-end">
          <Link
            to="/templates/custom"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all sm:w-auto w-full"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" />
            {t("templates.createCustom")}
          </Link>
          <Link
            to="/generate"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all sm:w-auto w-full"
          >
            <LayoutTemplate className="h-4 w-4" />
            {t("dashboard.generateNewPRD")}
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <DataTableControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onExportCSV={() => exportCSV('Katalog_Template', [
            { header: "Nama", key: "name" },
            { header: "Deskripsi", key: "description" },
            { header: "Kategori", key: "category" },
            { header: "Kompleksitas", key: "complexity" },
            { header: "Estimasi Waktu", key: "timeEstimation" }
          ])}
          onExportPDF={() => exportPDF('templates-content', 'Katalog_Template')}
          searchPlaceholder={t("templates.searchPlaceholder")}
          filterComponent={
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="h-10 w-full sm:w-48 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"
            >
              <option value="all">{t("templates.filterCategory")}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          }
        />
      </div>

      <div id="templates-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {currentData.map((template) => (
            <div
              key={template.id}
              className={`group relative flex flex-col justify-between rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full overflow-hidden`}
            >
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`p-3.5 rounded-xl ${template.color} border ${template.borderColor} shadow-sm shrink-0`}
                  >
                    <template.icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {template.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Clock className="w-3.5 h-3.5" /> {template.timeEstimation}
                    </span>
                  </div>
                </div>

                {template.isCommunity && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
                      <Users className="w-3 h-3" /> Komunitas
                    </span>
                    {template.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Award className="w-3 h-3" /> Pilihan Admin
                      </span>
                    )}
                    {template.rating > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" /> {template.rating.toFixed(1)} ({template.ratingCount})
                      </span>
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors leading-snug">
                    {template.name}
                  </h3>
                  {template.authorName && (
                    <p className="text-xs text-gray-400 mb-3">Oleh: <span className="font-medium text-gray-600">{template.authorName}</span></p>
                  )}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                    {template.description}
                  </p>

                  <div className="space-y-4 mb-8">
                    {/* Additional Metadata */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 mb-4">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Target Audiens</span>
                         <span className="text-xs sm:text-sm font-medium text-gray-800">{template.audience || "-"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Rekomendasi Tech</span>
                         <span className="text-xs sm:text-sm font-medium text-gray-800">{template.techStack || "-"}</span>
                      </div>
                    </div>

                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-3">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                      Fitur Utama
                    </div>
                    <ul className="space-y-2.5">
                      {template.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700 leading-snug"
                        >
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between w-full sm:w-auto gap-2">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Kompleksitas
                  </span>
                  <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200">
                    {template.complexity}
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPreviewModalTemplate(template)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    title="Lihat Detail & Simulasi Modal"
                  >
                    <Eye className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Detail & Simulasi</span>
                  </button>
                  {template.isCommunity && (
                    <>
                      <Link
                        to={`/templates/${template.id}`}
                        className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
                      >
                        Detail
                      </Link>
                      {(template.createdBy === user?.uid || !template.createdBy) && (
                        <Link
                          to={`/templates/custom?edit=${template.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-amber-100 transition-all"
                          title="Edit Template"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                    </>
                  )}
                  <Link
                    to={`/generate?template=${template.id}`}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Gunakan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {currentData.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 text-sm text-gray-500 mb-8">
            Tidak ada template yang cocok dengan pencarian dan filter.
          </div>
        )}
        
        {currentData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" data-html2canvas-ignore="true">
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

      {/* DETAIL & SIMULASI MODAL DIALOG */}
      {previewModalTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <LayoutTemplate className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
                    {previewModalTemplate.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                    {previewModalTemplate.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewModalTemplate(null)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Deskripsi Lengkap</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {previewModalTemplate.description}
                </p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Target Audiens</span>
                  <span className="text-xs font-semibold text-gray-800">{previewModalTemplate.audience || "-"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Tech Stack</span>
                  <span className="text-xs font-semibold text-gray-800">{previewModalTemplate.techStack || "-"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Kompleksitas</span>
                  <span className="text-xs font-semibold text-gray-800">{previewModalTemplate.complexity || "Sedang"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Estimasi Waktu</span>
                  <span className="text-xs font-semibold text-gray-800">{previewModalTemplate.timeEstimation || "-"}</span>
                </div>
              </div>

              {/* Fitur Utama List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Fitur Utama & Arsitektur Sistem:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {previewModalTemplate.features?.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-700 font-medium shadow-2xs">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              <button
                onClick={() => setPreviewModalTemplate(null)}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                Tutup Modal
              </button>
              <Link
                to={`/generate?template=${previewModalTemplate.id}`}
                onClick={() => setPreviewModalTemplate(null)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
              >
                <span>Gunakan & Buat PRD</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

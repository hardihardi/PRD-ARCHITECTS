import React, { useState } from "react";
import mammoth from "mammoth";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag,
  Target,
  Users,
  ShieldAlert,
  Cpu,
  Layers,
  Copy,
  Check,
  Zap,
  ArrowRight,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { motion, AnimatePresence } from "motion/react";

interface PRDDocumentAnalyzerProps {
  onApplyToWizard?: (payload: any) => void;
  onApplyToPRDDoc?: (sections: any[]) => void;
  onClose?: () => void;
}

export function PRDDocumentAnalyzer({
  onApplyToWizard,
  onApplyToPRDDoc,
  onClose,
}: PRDDocumentAnalyzerProps) {
  const [activeInputTab, setActiveInputTab] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [fileName, setFileName] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [appliedSuccessMsg, setAppliedSuccessMsg] = useState("");

  // Handle File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setAnalysisError("");
    setAppliedSuccessMsg("");

    try {
      if (selectedFile.name.endsWith(".docx")) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setDocumentContent(result.value);
      } else {
        const text = await selectedFile.text();
        setDocumentContent(text);
      }
    } catch (err: any) {
      console.error("Gagal membaca file:", err);
      setAnalysisError("Gagal membaca file. Pastikan format file adalah .txt, .docx, atau .md.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setFileName(droppedFile.name);
    setAnalysisError("");
    setAppliedSuccessMsg("");

    try {
      if (droppedFile.name.endsWith(".docx")) {
        const arrayBuffer = await droppedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setDocumentContent(result.value);
      } else {
        const text = await droppedFile.text();
        setDocumentContent(text);
      }
    } catch (err: any) {
      console.error("Gagal membaca file:", err);
      setAnalysisError("Gagal membaca file. Gunakan format .txt, .docx, atau .md.");
    }
  };

  const handleRunDocumentAnalysis = async () => {
    const textToAnalyze =
      activeInputTab === "file" ? documentContent : pastedText.trim();

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      setAnalysisError("Tolong unggah file dokumen atau tempelkan teks spesifikasi.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");
    setAppliedSuccessMsg("");

    try {
      const response = await fetch("/api/v1/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: textToAnalyze,
          fileName: fileName || "Spesifikasi-Pasted.txt",
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menganalisis dokumen.");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Terjadi kesalahan saat memproses dokumen.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyPayload = () => {
    if (!analysisResult) return;
    if (onApplyToWizard) {
      onApplyToWizard(analysisResult);
      setAppliedSuccessMsg("Isi form PRD Generator telah berhasil diperbarui dari analisis dokumen!");
    } else if (onApplyToPRDDoc && analysisResult.enrichmentPayload?.suggestedSections) {
      onApplyToPRDDoc(analysisResult.enrichmentPayload.suggestedSections);
      setAppliedSuccessMsg("Seksi-seksi PRD baru berhasil ditambahkan ke dokumen!");
    }
  };

  const handleCopyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 1500);
  };

  const textLength = activeInputTab === "file" ? documentContent.length : pastedText.length;
  const wordCount = (activeInputTab === "file" ? documentContent : pastedText)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-[#e4e6e8] shadow-[0_4px_20px_0_rgba(67,89,113,0.12)] p-5 sm:p-7 space-y-6 text-[#566a7f]">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-4 border-b border-[#e4e6e8] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#e7e7ff] text-[#696cff] rounded-xl font-bold">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#384756]">
              AI Document Analyzer & Requirements Extractor
            </h2>
          </div>
          <p className="text-xs text-[#7a838b] leading-relaxed">
            Unggah dokumen BRD/spesifikasi (.txt, .docx, .md) atau tempelkan teks. AI Gemini akan merangkum, mengekstrak entitas kunci, kebutuhan fungsional, persona, dan kata kunci domain untuk otomatis mengisi PRD Generator.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-[#a1acb8] hover:text-[#566a7f] hover:bg-[#f5f5f9] rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-[#e4e6e8] pb-3">
        <button
          onClick={() => {
            setActiveInputTab("file");
            setAnalysisError("");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeInputTab === "file"
              ? "bg-[#696cff] text-white shadow-sm"
              : "bg-[#f5f5f9] text-[#566a7f] hover:bg-[#e7e7ff] hover:text-[#696cff]"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Unggah File Dokumen (.docx, .txt, .md)</span>
        </button>

        <button
          onClick={() => {
            setActiveInputTab("text");
            setAnalysisError("");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeInputTab === "text"
              ? "bg-[#696cff] text-white shadow-sm"
              : "bg-[#f5f5f9] text-[#566a7f] hover:bg-[#e7e7ff] hover:text-[#696cff]"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Tempelkan Teks Spesifikasi</span>
        </button>
      </div>

      {/* Input Area */}
      {activeInputTab === "file" ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#c7d2fe] bg-[#f8f9ff] hover:bg-[#f0f2ff] rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer group space-y-3"
        >
          <input
            type="file"
            id="doc-upload-input"
            accept=".txt,.docx,.md,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="doc-upload-input" className="cursor-pointer space-y-3 block">
            <div className="w-12 h-12 bg-white rounded-2xl border border-[#c7d2fe] flex items-center justify-center mx-auto text-[#696cff] shadow-sm group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#384756]">
                {file ? file.name : "Klik untuk memilih file atau seret file ke sini"}
              </p>
              <p className="text-[11px] text-[#7a838b] mt-1">
                Mendukung format .docx (Word), .txt, .md, dan .json (Ukuran maks: 10MB)
              </p>
            </div>
          </label>

          {file && (
            <div className="pt-2 border-t border-[#e4e6e8] flex items-center justify-center gap-3 text-xs text-[#696cff] font-semibold">
              <FileCode className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-[#a1acb8]">•</span>
              <span>{(file.size / 1024).toFixed(1)} KB</span>
              <span className="text-[#a1acb8]">•</span>
              <span>{wordCount} kata</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#384756] block">
            Tempelkan Draf Spesifikasi atau Catatan Kebutuhan:
          </label>
          <Textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Contoh: Kami ingin membangun platform e-commerce B2B untuk industri distribusi makanan. Pengguna dapat melakukan pemesanan partai besar, integrasi dengan pembayaran VA dan Tempo 30 Hari, serta pelacakan pengiriman driver secara real-time..."
            className="min-h-[160px] text-xs font-sans leading-relaxed focus:border-[#696cff]"
          />
          <div className="flex items-center justify-between text-[11px] text-[#7a838b]">
            <span>Panjang Teks: {textLength} karakter</span>
            <span>Jumlah Kata: {wordCount} kata</span>
          </div>
        </div>
      )}

      {/* Error / Success Messages */}
      {analysisError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {appliedSuccessMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{appliedSuccessMsg}</span>
        </div>
      )}

      {/* Analysis Trigger Button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-[#7a838b]">
          Diproses oleh model <strong className="text-[#696cff]">Gemini 2.5 Flash</strong>
        </span>

        <Button
          onClick={handleRunDocumentAnalysis}
          disabled={isAnalyzing || textLength === 0}
          className="bg-[#696cff] hover:bg-[#5a5ddb] text-white font-bold text-xs rounded-xl shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] px-5 py-2.5 h-auto flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Menganalisis Dokumen...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Mulai Ekstraksi AI & Analisis</span>
            </>
          )}
        </Button>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="pt-6 border-t border-[#e4e6e8] space-y-6"
          >
            {/* Action Bar */}
            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#c7d2fe] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 bg-[#e7e7ff] text-[#696cff] text-[11px] font-bold rounded-full inline-block mb-1">
                  {analysisResult.documentType || "Requirements Spec"}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#384756]">
                  Hasil Ekstraksi & Intelijen Dokumen Selesai
                </h3>
              </div>

              {(onApplyToWizard || onApplyToPRDDoc) && (
                <Button
                  onClick={handleApplyPayload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-4 py-2 h-auto flex items-center gap-1.5 shrink-0"
                >
                  <Zap className="h-4 w-4" />
                  <span>
                    {onApplyToWizard
                      ? "Otomatis Isi PRD Generator"
                      : "Tambahkan Seksi ke PRD Aktif"}
                  </span>
                </Button>
              )}
            </div>

            {/* Executive Summary */}
            <div className="p-4 bg-white rounded-xl border border-[#e4e6e8] shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-[#384756] uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#696cff]" />
                <span>Executive Summary Dokumen</span>
              </h4>
              <p className="text-xs text-[#566a7f] leading-relaxed whitespace-pre-wrap">
                {analysisResult.summary}
              </p>
            </div>

            {/* Key Entities & Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="p-3.5 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-1">
                <span className="text-[11px] font-bold text-[#7a838b] block">Nama Proyek</span>
                <span className="text-xs font-bold text-[#384756] block">
                  {analysisResult.keyEntities?.projectName || "Proyek Tanpa Nama"}
                </span>
              </div>

              <div className="p-3.5 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-1">
                <span className="text-[11px] font-bold text-[#7a838b] block">Tipe Proyek & Industri</span>
                <span className="text-xs font-bold text-[#384756] block">
                  {analysisResult.keyEntities?.projectType} ({analysisResult.keyEntities?.industry})
                </span>
              </div>

              <div className="p-3.5 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-1">
                <span className="text-[11px] font-bold text-[#7a838b] block">Pernyataan Masalah</span>
                <p className="text-xs text-[#566a7f] line-clamp-2">
                  {analysisResult.keyEntities?.problemStatement}
                </p>
              </div>
            </div>

            {/* Functional & Non-Functional Requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Functional Requirements */}
              <div className="p-4 bg-white rounded-xl border border-[#e4e6e8] shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#384756] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Kebutuhan Fungsional ({analysisResult.requirements?.functional?.length || 0})</span>
                </h4>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {(analysisResult.requirements?.functional || []).map((fr: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#696cff]">{fr.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            fr.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : fr.priority === "Medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {fr.priority || "Normal"}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-[#384756]">{fr.title}</h5>
                      <p className="text-[11px] text-[#7a838b] leading-relaxed">{fr.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical / Non-Functional Constraints */}
              <div className="p-4 bg-white rounded-xl border border-[#e4e6e8] shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#384756] uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>Kebutuhan Non-Fungsional ({analysisResult.requirements?.nonFunctional?.length || 0})</span>
                </h4>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {(analysisResult.requirements?.nonFunctional || []).map((nfr: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#384756]">{nfr.id}</span>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {nfr.type || "Constraint"}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-[#384756]">{nfr.title}</h5>
                      <p className="text-[11px] text-[#7a838b] leading-relaxed">{nfr.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Extracted Keywords & Tech Stack Rationale */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Keywords Tag Cloud */}
              <div className="p-4 bg-white rounded-xl border border-[#e4e6e8] shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#384756] uppercase tracking-wider flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#696cff]" />
                  <span>Kata Kunci & Istilah Domain</span>
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.keywords || []).map((kw: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyKeyword(kw)}
                      className="px-2.5 py-1 bg-[#f5f5f9] hover:bg-[#e7e7ff] text-[#566a7f] hover:text-[#696cff] text-xs font-medium rounded-lg border border-[#e4e6e8] transition-all flex items-center gap-1"
                      title="Klik untuk menyalin kata kunci"
                    >
                      <span>{kw}</span>
                      {copiedKeyword === kw ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-[#a1acb8]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Tech Stack */}
              <div className="p-4 bg-white rounded-xl border border-[#e4e6e8] shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#384756] uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-indigo-600" />
                  <span>Rekomendasi Tech Stack & Rasional</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 bg-[#e7e7ff] text-[#696cff] font-bold rounded-lg border border-[#c7d2fe]">
                      Framework: {analysisResult.suggestedTechStack?.framework}
                    </span>
                    <span className="px-2.5 py-1 bg-[#e7e7ff] text-[#696cff] font-bold rounded-lg border border-[#c7d2fe]">
                      Database: {analysisResult.suggestedTechStack?.database}
                    </span>
                    <span className="px-2.5 py-1 bg-[#e7e7ff] text-[#696cff] font-bold rounded-lg border border-[#c7d2fe]">
                      API: {analysisResult.suggestedTechStack?.apiStyle}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7a838b] leading-relaxed pt-1">
                    {analysisResult.suggestedTechStack?.rationale}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

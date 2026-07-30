import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/LanguageContext";
import { PRDCollabPanel } from "../components/prd/PRDCollabPanel";
import { PRDPresence } from "../components/prd/PRDPresence";
import { AIFeedbackWidget } from "../components/prd/AIFeedbackWidget";
import { PRDSectionEditor } from "../components/prd/PRDSectionEditor";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Download,
  Copy,
  FileDown,
  Check,
  MessageSquareQuote,
  Layers,
  Share
} from "lucide-react";
import { ShareTemplateModal } from "../components/prd/ShareTemplateModal";
import PushPMToolModal from "../components/prd/PushPMToolModal";

export function LibraryDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [prd, setPrd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [currentPresenceSection, setCurrentPresenceSection] = useState("Viewing Document");

  const [showQuoteButton, setShowQuoteButton] = useState(false);
  const [quotePosition, setQuotePosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    const docRef = doc(db, "prds", id);
    const unsubscribeDoc = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setPrd(data);
        } else {
          setError("Document not found");
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load document");
        setLoading(false);
      },
    );

    const q = query(
      collection(db, `prds/${id}/sections`),
      orderBy("order", "asc"),
    );
    const unsubscribeSections = onSnapshot(q, (snap) => {
      const secs = snap.docs.map((d) => ({ sectionId: d.id, ...d.data() }));
      setSections(secs);
    });

    return () => {
      unsubscribeDoc();
      unsubscribeSections();
    };
  }, [id]);

  useEffect(() => {
    // Migration logic
    if (
      prd &&
      !migrating &&
      sections.length === 0 &&
      prd.content &&
      !prd.migratedToSections
    ) {
      const migrate = async () => {
        setMigrating(true);
        try {
          const splitContents = prd.content
            .split(/(?=^##\s)/gm)
            .filter((s: string) => s.trim().length > 0);
          for (let i = 0; i < splitContents.length; i++) {
            await setDoc(doc(db, `prds/${prd.id}/sections`, `sec-${i}`), {
              content: splitContents[i],
              order: i,
            });
          }
          await updateDoc(doc(db, "prds", prd.id), {
            migratedToSections: true,
          });
        } catch (e) {
          console.error("Migration failed", e);
        } finally {
          setMigrating(false);
        }
      };
      migrate();
    }
  }, [prd, sections.length, migrating]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const text = selection.toString().trim();
        if (text) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          if (
            contentRef.current &&
            contentRef.current.contains(range.commonAncestorContainer)
          ) {
            setQuotePosition({
              top: rect.top + window.scrollY - 40,
              left: rect.left + window.scrollX + rect.width / 2 - 20,
            });
            setSelectedText(text);
            setShowQuoteButton(true);
          } else {
            setShowQuoteButton(false);
          }
        } else {
          setShowQuoteButton(false);
        }
      } else {
        setShowQuoteButton(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleQuoteClick = () => {
    const event = new CustomEvent("quote-text", { detail: selectedText });
    window.dispatchEvent(event);
    setShowQuoteButton(false);
  };

  const copyToClipboard = async () => {
    const fullText = sections.map((s) => s.content).join("\n\n");
    if (fullText) {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const exportToPdf = () => {
    const element = document.getElementById("library-prd-content");
    if (element) {
      element.classList.add("print-target");
      document.body.classList.add("printing-element-active");
      const originalTitle = document.title;
      document.title = `${prd?.projectName ? prd.projectName.replace(/\s+/g, "-") : "PRD"}-Document`;
      
      window.print();
      
      document.title = originalTitle;
      document.body.classList.remove("printing-element-active");
      element.classList.remove("print-target");
    }
  };

  if (loading && !prd) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error && !prd) {
    return (
      <div className="mx-auto max-w-4xl text-center py-20">
        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          {t("common.error")}
        </h2>
        <p className="mt-2 text-gray-500">{error || "Document not found"}</p>
        <Link
          to="/library"
          className="mt-6 inline-block text-indigo-600 hover:text-indigo-500 font-medium"
        >
          &larr; {t("common.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pb-12 flex flex-col lg:flex-row gap-6 relative">
      {showQuoteButton && (
        <button
          onClick={handleQuoteClick}
          style={{
            top: `${quotePosition.top}px`,
            left: `${quotePosition.left}px`,
          }}
          className="absolute z-50 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all outline-none"
          title="Quote in comments"
        >
          <MessageSquareQuote className="h-4 w-4" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/library"
            className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            {t("common.back")}
          </Link>

          {id && prd && <PRDPresence prdId={id} currentSection={currentPresenceSection} />}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-6 sm:p-8 border-b border-gray-200 bg-gray-50 flex flex-col xl:flex-row xl:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <Layers className="w-8 h-8 text-indigo-600" />
                {prd.projectName}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                  {prd.projectType}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                  {prd.framework}
                </span>
                {prd.createdAt && (
                  <span className="flex items-center">
                    {t("library.colCreated")}: {" "}
                    {new Date(
                      prd.createdAt?.seconds
                        ? prd.createdAt.seconds * 1000
                        : Date.now(),
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start pt-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-white border border-gray-300 px-3 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                title={t("libraryDesign.share")}
              >
                <Share className="h-4 w-4 text-gray-600" />
                <span className="hidden sm:inline">{t("libraryDesign.share")}</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="bg-white border border-gray-300 px-3 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                title={t("common.copy")}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
                <span className="hidden sm:inline">{isCopied ? t("common.copied") : t("common.copy")}</span>
              </button>
              <button
                onClick={() => {
                  const fullText = sections.map((s) => s.content).join("\n\n");
                  const blob = new Blob([fullText], {
                    type: "text/markdown",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${prd.projectName ? prd.projectName.replace(/\s+/g, "-") : "PRD"}-Document.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="bg-white border border-gray-300 px-3 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                title={t("common.download")}
              >
                <Download className="h-4 w-4 text-gray-500" />
                <span className="hidden sm:inline">Markdown</span>
              </button>
              <button
                onClick={exportToPdf}
                className="bg-white border border-gray-300 px-3 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                title={t("common.exportPDF")}
              >
                <FileDown className="h-4 w-4 text-gray-500" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={() => setShowPushModal(true)}
                className="bg-indigo-600 border border-indigo-700 text-white px-3 py-2 text-sm rounded-md shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
                title="Push to Jira / Asana"
              >
                <Layers className="h-4 w-4" />
                <span>Push to PM</span>
              </button>
            </div>
          </div>

          <div
            id="library-prd-content"
            ref={contentRef}
            className="p-6 sm:p-10 text-gray-800 text-left min-h-[500px]"
          >
            {migrating ? (
              <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-gray-600 font-medium font-sm text-center">
                  Preparing PRD for Real-Time Collaboration...
                </p>
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-2">
                {sections.map((section) => (
                  <PRDSectionEditor
                    key={section.sectionId}
                    prdId={id!}
                    sectionId={section.sectionId}
                    initialContent={section.content}
                    order={section.order}
                    lockedBy={section.lockedBy}
                    onFocus={() => {
                      const firstLine = section.content.trim().split("\n")[0] || "";
                      const sectionTitle = firstLine.replace(/^#+\s*/, "").trim() || `Section ${section.order + 1}`;
                      setCurrentPresenceSection(`Editing "${sectionTitle}"`);
                    }}
                    onBlur={() => {
                      setCurrentPresenceSection("Viewing Document");
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-gray-500">
                  Document is empty or formatting correctly...
                </p>
              </div>
            )}
            
            {!migrating && prd && sections.length > 0 && id && (
              <AIFeedbackWidget prdId={id} />
            )}
          </div>
        </div>
      </div>

      {id && (
        <div className="w-full lg:w-96 flex-shrink-0">
          <PRDCollabPanel prd={prd} prdId={id} />
        </div>
      )}

      {showShareModal && prd && (
        <ShareTemplateModal 
          prd={prd} 
          onClose={() => setShowShareModal(false)} 
        />
      )}

      {showPushModal && prd && (
        <PushPMToolModal
          isOpen={showPushModal}
          onClose={() => setShowPushModal(false)}
          prdTitle={prd.projectName || "PRD"}
          prdContent={sections.map((s) => s.content).join("\n\n")}
        />
      )}
    </div>
  );
}

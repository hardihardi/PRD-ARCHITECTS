import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAuth } from "../../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidChart } from "../MermaidChart";
import { Edit2, Save, X, Edit3, Lock } from "lucide-react";

export function PRDSectionEditor({
  prdId,
  sectionId,
  initialContent,
  order,
  lockedBy,
  onFocus,
  onBlur,
}: {
  prdId: string;
  sectionId: string;
  initialContent: string;
  order: number;
  lockedBy?: string | null;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLock, setCurrentLock] = useState<string | null>(
    lockedBy || null,
  );

  useEffect(() => {
    const docRef = doc(db, `prds/${prdId}/sections`, sectionId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCurrentLock(data.lockedBy || null);
        if (!isEditing) {
          setContent(data.content);
        }
      }
    });
    return unsub;
  }, [prdId, sectionId, isEditing]);

  const handleEditClick = async () => {
    if (currentLock && currentLock !== user?.email) return;
    setIsEditing(true);
    if (onFocus) onFocus();
    await updateDoc(doc(db, `prds/${prdId}/sections`, sectionId), {
      lockedBy: user?.email,
      lockedAt: serverTimestamp(),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, `prds/${prdId}/sections`, sectionId), {
        content,
        lockedBy: null,
      });

      // Save a new version with a descriptive note
      try {
        const sectionsRef = collection(db, `prds/${prdId}/sections`);
        const q = query(sectionsRef, orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        
        const sectionsData = snapshot.docs.map(d => {
          if (d.id === sectionId) {
            return content;
          }
          return d.data().content || "";
        });
        
        const mergedContent = sectionsData.join("\n\n");
        const firstLine = content.trim().split("\n")[0] || "";
        const sectionTitle = firstLine.replace(/^#+\s*/, "").trim() || `Section ${order + 1}`;

        await addDoc(collection(db, `prds/${prdId}/versions`), {
          content: mergedContent,
          updatedBy: user?.email || "Unknown User",
          updatedAt: serverTimestamp(),
          note: `Edited section: "${sectionTitle}"`,
        });
      } catch (versionErr) {
        console.error("Failed to save collaborative version history log:", versionErr);
      }

      setIsEditing(false);
      if (onBlur) onBlur();
    } catch (e) {
      console.error(e);
      alert("Failed to save section");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    setIsEditing(false);
    setContent(initialContent);
    if (onBlur) onBlur();
    try {
      await updateDoc(doc(db, `prds/${prdId}/sections`, sectionId), {
        lockedBy: null,
      });
    } catch (e) {
      console.error("Failed to release lock");
    }
  };

  revalidateLockOnUnmount();

  function revalidateLockOnUnmount() {
    useEffect(() => {
      return () => {
        if (isEditing) {
          updateDoc(doc(db, `prds/${prdId}/sections`, sectionId), {
            lockedBy: null,
          }).catch(() => {});
        }
      };
    }, [isEditing]);
  }

  const isLockedByOther = currentLock && currentLock !== user?.email;

  return (
    <div
      className={`relative group mb-6 rounded-xl border-2 transition-all ${isEditing ? "border-indigo-400 bg-white shadow-md" : "border-transparent hover:border-gray-200"}`}
    >
      {/* Overlay for lock status */}
      {!isEditing && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
          {isLockedByOther ? (
            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm">
              <Lock className="w-3.5 h-3.5" />
              Locked by {currentLock}
            </div>
          ) : (
            <Button
              onClick={handleEditClick}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 bg-white shadow-sm hover:text-indigo-600 hover:border-indigo-200"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Section
            </Button>
          )}
        </div>
      )}

      {isLockedByOther && !isEditing && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            Editing by {currentLock}...
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="p-4 bg-indigo-50/30 rounded-xl">
          <div className="flex items-center justify-between mb-3 border-b border-indigo-100 pb-3">
            <span className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Editing Section
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-8 text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-3.5 h-3.5" />{" "}
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[250px] font-mono text-sm leading-relaxed mb-0 bg-white"
          />
        </div>
      ) : (
        <div
          className={`p-4 rounded-xl ${isLockedByOther ? "opacity-60 grayscale-[20%]" : ""}`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: ({ node, ...props }: any) => {
                const hasMermaid = node?.children?.some(
                  (child: any) =>
                    child.tagName === "code" &&
                    child.properties?.className?.includes("language-mermaid"),
                );
                if (hasMermaid) {
                  return <div className="w-full mt-4" {...props} />;
                }
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 overflow-x-auto text-slate-800 font-mono text-xs w-full shadow-2xs">
                    <pre {...props} />
                  </div>
                );
              },
              code(props: any) {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || "");
                if (match && match[1] === "mermaid") {
                  return (
                    <MermaidChart chart={String(children).replace(/\n$/, "")} />
                  );
                }
                if (
                  node?.position?.start?.line !== node?.position?.end?.line ||
                  className
                ) {
                  return (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[0.875em] font-mono border border-indigo-100 break-words"
                    {...rest}
                  >
                    {children}
                  </code>
                );
              },
              h1: ({ ...props }: any) => (
                <h1
                  className="text-3xl lg:text-4xl font-bold mt-6 mb-6 text-gray-900 tracking-tight"
                  {...props}
                />
              ),
              h2: ({ ...props }: any) => (
                <h2
                  className="text-xl lg:text-2xl font-semibold mt-8 mb-4 text-gray-800 border-b border-gray-100 pb-2"
                  {...props}
                />
              ),
              h3: ({ ...props }: any) => (
                <h3
                  className="text-lg lg:text-xl font-semibold mt-6 mb-3 text-gray-800"
                  {...props}
                />
              ),
              p: ({ ...props }: any) => (
                <p
                  className="mb-4 text-gray-600 leading-relaxed max-w-4xl"
                  {...props}
                />
              ),
              ul: ({ ...props }: any) => (
                <ul
                  className="list-disc pl-6 mb-4 text-gray-600 space-y-1"
                  {...props}
                />
              ),
              ol: ({ ...props }: any) => (
                <ol
                  className="list-decimal pl-6 mb-4 text-gray-600 space-y-1"
                  {...props}
                />
              ),
              li: ({ ...props }: any) => <li className="pl-2" {...props} />,
              a: ({ ...props }: any) => (
                <a
                  className="text-indigo-600 hover:text-indigo-500 font-medium underline underline-offset-2"
                  {...props}
                />
              ),
              strong: ({ ...props }: any) => (
                <strong className="font-semibold text-gray-900" {...props} />
              ),
              blockquote: ({ ...props }: any) => (
                <blockquote
                  className="border-l-4 border-indigo-200 pl-4 py-2 italic text-gray-500 my-6 bg-gray-50 rounded-r-lg"
                  {...props}
                />
              ),
              table: ({ ...props }: any) => (
                <div className="overflow-x-auto my-6">
                  <table
                    className="min-w-full divide-y divide-gray-300 border border-gray-200 rounded-lg"
                    {...props}
                  />
                </div>
              ),
              thead: ({ ...props }: any) => (
                <thead className="bg-gray-50" {...props} />
              ),
              tbody: ({ ...props }: any) => (
                <tbody
                  className="divide-y divide-gray-200 bg-white"
                  {...props}
                />
              ),
              th: ({ ...props }: any) => (
                <th
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  {...props}
                />
              ),
              td: ({ ...props }: any) => (
                <td
                  className="px-3 py-4 text-sm text-gray-500 whitespace-normal break-words"
                  {...props}
                />
              ),
            }}
          >
            {content || ""}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  MessageSquare,
  History,
  Users,
  Send,
  UserPlus,
  Clock,
  Quote,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ShieldAlert,
  ListChecks,
  Award,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";

export function PRDCollabPanel({ prd, prdId }: { prd: any; prdId: string }) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("comments");
  const [comments, setComments] = useState<any[]>([]);
  const [commentFilter, setCommentFilter] = useState<"all" | "active" | "resolved">("all");
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>(
    prd?.collaborators || [],
  );

  const [newComment, setNewComment] = useState("");
  const [newCollaborator, setNewCollaborator] = useState("");

  // AI Analysis states
  const [sections, setSections] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [expandedArchitecture, setExpandedArchitecture] = useState<Record<number, boolean>>({});

  // Load Sections
  useEffect(() => {
    const q = query(
      collection(db, `prds/${prdId}/sections`),
      orderBy("order", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setSections(snapshot.docs.map((doc) => doc.data()));
    });
    return unsub;
  }, [prdId]);

  // Load latest persistent AI Analysis
  useEffect(() => {
    const unsub = onSnapshot(doc(db, `prds/${prdId}/aiAnalysis`, "latest"), (docSnap) => {
      if (docSnap.exists()) {
        setAnalysisResult(docSnap.data());
      } else {
        setAnalysisResult(null);
      }
    });
    return unsub;
  }, [prdId]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError("");
    try {
      const response = await fetch("/api/v1/analyze-prd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectName: prd?.projectName || "Proyek Tanpa Nama",
          projectType: prd?.projectType || "General",
          industry: prd?.industry || "Technology",
          framework: prd?.framework || "General",
          database: prd?.database || "General",
          sections: sections
        })
      });

      if (!response.ok) {
        throw new Error("Gagal memanggil API Analisis AI.");
      }

      const data = await response.json();
      await setDoc(doc(db, `prds/${prdId}/aiAnalysis`, "latest"), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Gagal melakukan analisis PRD.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Listen for text selection quotes
  useEffect(() => {
    const handleQuoteText = (e: any) => {
      setNewComment(`> ${e.detail}\n\n`);
      setActiveTab("comments");
    };
    window.addEventListener("quote-text", handleQuoteText);
    return () => window.removeEventListener("quote-text", handleQuoteText);
  }, []);

  // Load Comments
  useEffect(() => {
    const q = query(
      collection(db, `prds/${prdId}/comments`),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [prdId]);

  // Load Versions
  useEffect(() => {
    const q = query(
      collection(db, `prds/${prdId}/versions`),
      orderBy("updatedAt", "desc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setVersions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [prdId]);

  useEffect(() => {
    if (prd?.collaborators) {
      setCollaborators(prd.collaborators);
    }
  }, [prd?.collaborators]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    try {
      await addDoc(collection(db, `prds/${prdId}/comments`), {
        text: newComment.trim(),
        createdBy: user.email,
        createdAt: serverTimestamp(),
        isResolved: false,
        replies: [],
      });
      setNewComment("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddReply = async (commentId: string) => {
    const text = replyInput[commentId]?.trim();
    if (!text || !user) return;

    try {
      const commentRef = doc(db, `prds/${prdId}/comments`, commentId);
      const targetComment = comments.find((c) => c.id === commentId);
      const existingReplies = targetComment?.replies || [];

      const newReply = {
        id: `reply-${Date.now()}`,
        text,
        createdBy: user.email,
        createdAt: new Date().toISOString(),
      };

      await updateDoc(commentRef, {
        replies: [...existingReplies, newReply],
      });

      setReplyInput((prev) => ({ ...prev, [commentId]: "" }));
      setReplyingToId(null);
    } catch (e) {
      console.error("Gagal menambahkan balasan komentar:", e);
    }
  };

  const handleToggleResolve = async (commentId: string, currentResolved: boolean) => {
    try {
      const commentRef = doc(db, `prds/${prdId}/comments`, commentId);
      await updateDoc(commentRef, {
        isResolved: !currentResolved,
        resolvedBy: !currentResolved ? user?.email : null,
        resolvedAt: !currentResolved ? new Date().toISOString() : null,
      });
    } catch (e) {
      console.error("Gagal memperbarui status resolusi komentar:", e);
    }
  };

  const handleInvite = async () => {
    if (!newCollaborator.trim()) return;
    try {
      const updatedCollaborators = [
        ...new Set([...collaborators, newCollaborator.trim()]),
      ];
      await updateDoc(doc(db, "prds", prdId), {
        collaborators: updatedCollaborators,
      });
      setNewCollaborator("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestore = async (content: string) => {
    if (!content) return;
    try {
      await updateDoc(doc(db, "prds", prdId), {
        content: content,
        updatedAt: serverTimestamp(),
      });

      // Split the restored content into individual sections and write them to Firestore
      const splitContents = content
        .split(/(?=^##\s)/gm)
        .filter((s: string) => s.trim().length > 0);

      const sectionsRef = collection(db, `prds/${prdId}/sections`);
      const existingSnap = await getDocs(query(sectionsRef, orderBy("order", "asc")));
      const existingIds = existingSnap.docs.map(d => d.id);

      for (let i = 0; i < splitContents.length; i++) {
        await setDoc(doc(db, `prds/${prdId}/sections`, `sec-${i}`), {
          content: splitContents[i],
          order: i,
          lockedBy: null,
        });
      }

      // If we have more old sections than the new split, delete the excess old sections
      if (existingIds.length > splitContents.length) {
        for (let i = splitContents.length; i < existingIds.length; i++) {
          await deleteDoc(doc(db, `prds/${prdId}/sections`, existingIds[i]));
        }
      }

      // also save version
      await addDoc(collection(db, `prds/${prdId}/versions`), {
        content: content,
        updatedBy: user?.email,
        updatedAt: serverTimestamp(),
        note: "Restored from previous version",
      });
    } catch (e) {
      console.error("Failed to restore previous version:", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <div className="px-4 pt-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-4">
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg rounded-b-none px-4 py-2"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger
              value="versions"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg rounded-b-none px-4 py-2"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg rounded-b-none px-4 py-2"
            >
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg rounded-b-none px-4 py-2"
            >
              <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
              AI Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="comments"
          className="flex-1 overflow-hidden m-0 flex flex-col p-0"
        >
          {/* Thread Filter Bar */}
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setCommentFilter("all")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  commentFilter === "all"
                    ? "bg-[#696cff] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({comments.length})
              </button>
              <button
                onClick={() => setCommentFilter("active")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  commentFilter === "active"
                    ? "bg-[#696cff] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Active ({comments.filter((c) => !c.isResolved).length})
              </button>
              <button
                onClick={() => setCommentFilter("resolved")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  commentFilter === "resolved"
                    ? "bg-[#696cff] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Resolved ({comments.filter((c) => c.isResolved).length})
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {comments.filter((c) => {
                if (commentFilter === "active") return !c.isResolved;
                if (commentFilter === "resolved") return !!c.isResolved;
                return true;
              }).length === 0 && (
                <div className="text-center text-gray-500 text-xs py-12 space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>Tidak ada komentar untuk filter ini.</p>
                </div>
              )}

              {comments
                .filter((c) => {
                  if (commentFilter === "active") return !c.isResolved;
                  if (commentFilter === "resolved") return !!c.isResolved;
                  return true;
                })
                .map((comment) => {
                  const isResolved = !!comment.isResolved;
                  const replies = comment.replies || [];
                  const isReplying = replyingToId === comment.id;

                  return (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                        isResolved
                          ? "bg-gray-50/80 border-gray-200 opacity-75"
                          : "bg-white border-gray-200 shadow-2xs"
                      }`}
                    >
                      {/* Comment Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7 shrink-0">
                            <AvatarFallback className="bg-[#e7e7ff] text-[#696cff] text-xs font-bold">
                              {comment.createdBy?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-bold text-xs text-gray-900 block">
                              {comment.createdBy}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              {comment.createdAt?.toDate
                                ? comment.createdAt
                                    .toDate()
                                    .toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                : "Baru saja"}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleToggleResolve(comment.id, isResolved)}
                          variant="ghost"
                          size="sm"
                          className={`h-6 text-[10px] font-bold px-2 rounded-lg gap-1 ${
                            isResolved
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {isResolved ? "Resolved" : "Mark Resolved"}
                        </Button>
                      </div>

                      {/* Comment Text */}
                      <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap pl-9">
                        {comment.text
                          .split("\n")
                          .map((line: string, i: number) =>
                            line.startsWith("> ") ? (
                              <div
                                key={i}
                                className="border-l-2 border-[#696cff] pl-2 text-gray-600 italic my-1 text-[11px] bg-[#f8f9ff] p-1.5 rounded-r-md font-sans"
                              >
                                {line.substring(2)}
                              </div>
                            ) : (
                              <p key={i}>{line}</p>
                            )
                          )}
                      </div>

                      {/* Nested Replies */}
                      {replies.length > 0 && (
                        <div className="pl-9 space-y-2 border-l-2 border-gray-100 ml-3 pt-1">
                          {replies.map((reply: any) => (
                            <div key={reply.id} className="bg-gray-50 p-2.5 rounded-xl text-xs space-y-1 border border-gray-100">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-gray-900">{reply.createdBy}</span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Toggle & Box */}
                      <div className="pl-9 pt-1 flex items-center justify-between">
                        <button
                          onClick={() => setReplyingToId(isReplying ? null : comment.id)}
                          className="text-[11px] font-bold text-[#696cff] hover:underline"
                        >
                          {isReplying ? "Batal Balas" : "Balas Komentar"}
                        </button>
                      </div>

                      {isReplying && (
                        <div className="pl-9 pt-2 space-y-2">
                          <Textarea
                            value={replyInput[comment.id] || ""}
                            onChange={(e) =>
                              setReplyInput({ ...replyInput, [comment.id]: e.target.value })
                            }
                            placeholder="Tulis balasan Anda..."
                            className="text-xs min-h-[60px]"
                          />
                          <Button
                            onClick={() => handleAddReply(comment.id)}
                            size="sm"
                            className="bg-[#696cff] text-white text-xs h-7 px-3 rounded-lg"
                          >
                            Kirim Balasan
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-gray-100 bg-white">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Pilih teks pada PRD untuk mengutip, atau ketik diskusi umum..."
              className="mb-2 min-h-[80px] text-xs"
            />
            <Button onClick={handleAddComment} className="w-full bg-[#696cff] hover:bg-[#5a5ddb] text-white font-bold text-xs">
              Kirim Komentar
            </Button>
          </div>
        </TabsContent>

        <TabsContent
          value="versions"
          className="flex-1 m-0 p-4 overflow-y-auto"
        >
          <div className="space-y-4 border-l-2 border-gray-100 ml-4 pl-4 pt-2">
            {versions.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                No version history available.
              </div>
            )}
            {versions.map((version) => (
              <div key={version.id} className="relative mb-6">
                <div className="absolute -left-[25px] top-1 w-3 h-3 bg-indigo-600 rounded-full border-4 border-white shadow-sm" />
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-900">
                      {version.updatedAt?.toDate
                        ? version.updatedAt.toDate().toLocaleString()
                        : "..."}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Saved by{" "}
                    <span className="font-medium text-gray-800">
                      {version.updatedBy || "Unknown"}
                    </span>
                  </p>
                  {version.note && (
                    <p className="text-xs text-indigo-600 mb-3 bg-indigo-50 px-2 py-1 rounded inline-block">
                      {version.note}
                    </p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={() => handleRestore(version.content)}
                  >
                    Restore Version
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="flex-1 m-0 p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 text-left">
              Invite Collaborator
            </h3>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
              />
              <Button onClick={handleInvite} size="icon" className="shrink-0">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 text-left">
              Current Collaborators ({collaborators.length})
            </h3>
            <div className="space-y-3">
              {collaborators.map((email, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 text-left"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="flex-1 m-0 p-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-700 text-center animate-pulse">
                  AI sedang memeriksa kualitas, konsistensi, risiko, & arsitektur alternatif...
                </p>
                <p className="text-xs text-gray-400 mt-2">Ini mungkin memakan waktu beberapa detik</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-6 pb-6 text-left">
                {/* Score Section */}
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Skor Kesiapan PRD
                    </h3>
                    <p className="text-xs text-indigo-700 mt-1">Evaluasi komprehensif struktur & spesifikasi sistem.</p>
                  </div>
                  <div className="relative shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-indigo-500 shadow-sm">
                    <span className="text-base font-extrabold text-indigo-900">{analysisResult.overallScore || 0}</span>
                  </div>
                </div>

                {/* Clarity Feedback */}
                {analysisResult.clarityFeedback && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kejelasan (Clarity)
                    </h4>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult.clarityFeedback}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Completeness Feedback */}
                {analysisResult.completenessFeedback && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-sky-500" /> Kelengkapan (Completeness)
                    </h4>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult.completenessFeedback}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Consistency Feedback */}
                {analysisResult.consistencyFeedback && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> Konsistensi (Consistency)
                    </h4>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult.consistencyFeedback}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Tech Stack Optimization */}
                {analysisResult.techStackOptimization && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-500" /> Optimasi Tech Stack
                    </h4>
                    <div className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult.techStackOptimization}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Risks Checklist */}
                {Array.isArray(analysisResult.potentialRisks) && analysisResult.potentialRisks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" /> Potensi Risiko Teknis & UX
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.potentialRisks.map((risk: any, idx: number) => (
                        <div key={idx} className="p-3 bg-red-50/40 border border-red-100 rounded-xl space-y-1 text-left">
                          <span className="inline-block text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            {risk.riskType || "Risiko"}
                          </span>
                          <p className="text-xs font-semibold text-gray-900 mt-1">{risk.description}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            <strong className="text-gray-900">Mitigasi:</strong> {risk.mitigation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alternative Architectures */}
                {Array.isArray(analysisResult.alternativeArchitectures) && analysisResult.alternativeArchitectures.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-indigo-500" /> Arsitektur Alternatif
                    </h4>
                    <div className="space-y-2.5">
                      {analysisResult.alternativeArchitectures.map((alt: any, idx: number) => {
                        const isExpanded = !!expandedArchitecture[idx];
                        return (
                          <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <button
                              onClick={() => setExpandedArchitecture(prev => ({ ...prev, [idx]: !isExpanded }))}
                              className="w-full flex items-center justify-between p-3 text-left font-semibold text-xs text-gray-900 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                            >
                              <span>{alt.architectureName}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                            </button>
                            {isExpanded && (
                              <div className="p-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-700">
                                <p>{alt.description}</p>
                                {Array.isArray(alt.pros) && (
                                  <div>
                                    <strong className="text-emerald-700 block mb-0.5">Kelebihan (Pros):</strong>
                                    <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
                                      {alt.pros.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {Array.isArray(alt.cons) && (
                                  <div>
                                    <strong className="text-red-700 block mb-0.5">Kelemahan (Cons):</strong>
                                    <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
                                      {alt.cons.map((c: string, i: number) => <li key={i}>{c}</li>)}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 px-4 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900">Belum Ada Analisis AI</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Kirimkan draf PRD ini ke modul analis kami untuk mengevaluasi kelengkapan, mendapatkan usulan optimasi stack, mitigasi risiko, & arsitektur alternatif.
                  </p>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium text-left mt-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-gray-100 bg-white">
            <Button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || sections.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              {analysisResult ? "Analisis Ulang PRD dengan AI" : "Jalankan Analisis PRD dengan AI"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Star, ArrowLeft, Clock, Zap, CheckCircle2, Award, Users, Loader2, Download, Copy, Check } from "lucide-react";

export function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  // Rating form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTemplate = async () => {
      try {
        const docRef = doc(db, "templates", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTemplate({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();

    const q = query(collection(db, `templates/${id}/reviews`), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, `templates/${id}/reviews`), {
        userId: user.uid,
        userName: user.displayName || user.email || "Anonymous",
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      // Update average rating
      const newCount = (template.ratingCount || 0) + 1;
      const newRating = ((template.rating || 0) * (template.ratingCount || 0) + rating) / newCount;
      
      await updateDoc(doc(db, "templates", id), {
        rating: newRating,
        ratingCount: newCount
      });
      
      setTemplate(prev => ({...prev, rating: newRating, ratingCount: newCount}));
      setComment("");
      setRating(5);
    } catch (e) {
      console.error("Failed to submit review", e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleFeatured = async () => {
    if (!id || !template) return;
    try {
      await updateDoc(doc(db, "templates", id), {
        isFeatured: !template.isFeatured
      });
      setTemplate(prev => ({ ...prev, isFeatured: !template.isFeatured }));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900">{t("common.noData")}</h2>
        <Link to="/templates" className="text-indigo-600 hover:underline mt-4 inline-block">{t("common.back")}</Link>
      </div>
    );
  }

  const copyToClipboard = async () => {
    if (!template.content) return;
    try {
      await navigator.clipboard.writeText(template.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const downloadMarkdown = () => {
    if (!template.content) return;
    const blob = new Blob([template.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const features = Array.isArray(template.features) ? template.features : (template.features || "").split('\n');

  return (
    <div className="w-full py-10 space-y-8">
      <Link to="/templates" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> {t("common.back")}
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {template.category || "General"}
              </span>
              {template.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  <Award className="w-3.5 h-3.5" /> Featured
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
            {template.authorName && (
              <p className="text-sm text-gray-500 mb-6">By <span className="font-medium text-gray-700">{template.authorName}</span></p>
            )}

            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              {template.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button onClick={() => navigate(`/generate?template=${template.id}`)} className="w-full">
              {t("templates.useTemplate")}
            </Button>
            
            {template.content && (
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1" title="Salin Markdown">
                  {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button onClick={downloadMarkdown} variant="outline" className="flex-1" title="Unduh Markdown">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}

            {user && (
              <Button onClick={toggleFeatured} variant="outline" className="w-full">
                {template.isFeatured ? "Un-feature Template" : "Jadikan Featured"}
              </Button>
            )}
            
            {template.rating > 0 && (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl mt-2 border border-gray-100">
                <div className="flex items-center gap-1.5 text-2xl font-bold text-gray-900">
                  {template.rating.toFixed(1)} <Star className="w-6 h-6 text-amber-500 fill-current" />
                </div>
                <div className="text-xs text-gray-500 mt-1">{template.ratingCount} Ulasan</div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50">
           <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-500" /> Fitur Utama
                </h3>
                <ul className="space-y-3">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div>
                   <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Kompleksitas</span>
                   <span className="text-sm font-medium text-gray-900">{template.complexity || "-"}</span>
                </div>
                <div>
                   <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Estimasi Waktu</span>
                   <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400"/> {template.timeEstimation || "-"}</span>
                </div>
                <div>
                   <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Target Audiens</span>
                   <span className="text-sm font-medium text-gray-900">{template.audience || "-"}</span>
                </div>
                <div>
                   <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Tech Stack</span>
                   <span className="text-sm font-medium text-gray-900">{template.techStack || "-"}</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Ulasan & Rating</h2>
        </div>
        
        {user ? (
          <form onSubmit={submitReview} className="p-6 border-b border-gray-100 bg-gray-50 flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Beri Rating:</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setRating(star)}>
                      <Star className={`w-5 h-5 ${rating >= star ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={2}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Bagikan pengalaman Anda menggunakan template ini..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submittingReview}>
                {submittingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Kirim Ulasan"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-6 border-b border-gray-100 bg-gray-50 text-center text-gray-500 text-sm">
            Silakan login untuk memberikan ulasan.
          </div>
        )}

        <div className="p-6 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">Belum ada ulasan untuk template ini.</div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                  {review.userName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-900">{review.userName}</div>
                    <div className="text-xs text-gray-500">
                      {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Baru saja'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";

export function ShareTemplateModal({ prd, onClose }: { prd: any, onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: prd.projectName || "",
    description: prd.projectDescription || prd.description || "",
    category: prd.projectType || "General",
    features: prd.expectedOutcome || "",
    audience: prd.targetUser || "",
    techStack: prd.framework || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Anda harus login untuk membagikan template");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "templates"), {
        ...formData,
        features: formData.features.split("\n").filter((f: string) => f.trim() !== ""),
        authorId: user.uid,
        authorName: user.displayName || user.email || "Unknown User",
        isFeatured: false,
        rating: 0,
        ratingCount: 0,
        createdAt: serverTimestamp(),
        prdId: prd.id || null, // reference to original PRD
        content: prd.content || "" // Store the full content so we can clone it
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to share template");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bagikan sebagai Template</h2>
            <p className="text-sm text-gray-500 mt-1">Publikasikan PRD ini ke Marketplace agar pengguna lain dapat menggunakannya.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Template *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                placeholder="Misal: E-Commerce, SaaS, dll"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fitur Utama (Satu per baris)</label>
              <textarea
                rows={4}
                value={formData.features}
                onChange={e => setFormData(p => ({ ...p, features: e.target.value }))}
                placeholder="- Autentikasi User&#10;- Dashboard Admin"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audiens</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={e => setFormData(p => ({ ...p, audience: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={e => setFormData(p => ({ ...p, techStack: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Bagikan Template
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

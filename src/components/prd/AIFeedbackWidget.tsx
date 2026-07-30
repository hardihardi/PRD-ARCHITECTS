import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { Star, MessageSquareText, ThumbsUp, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export function AIFeedbackWidget({ prdId }: { prdId: string }) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<number>(0);

  useEffect(() => {
    if (!user || !prdId) return;
    const checkFeedback = async () => {
      const q = query(
        collection(db, `prds/${prdId}/feedback`),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setHasSubmitted(true);
        setSubmittedRating(snapshot.docs[0].data().rating);
      }
    };
    checkFeedback();
  }, [prdId, user]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, `prds/${prdId}/feedback`), {
        userId: user.uid,
        userEmail: user.email,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      
      // Also add to global feedback log for admin analysis
      await addDoc(collection(db, "global_feedback"), {
        prdId,
        userId: user.uid,
        userEmail: user.email,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });

      setHasSubmitted(true);
      setSubmittedRating(rating);
    } catch (e) {
      console.error("Failed to submit feedback", e);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mt-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
          <ThumbsUp className="w-6 h-6 text-indigo-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Thank You for Your Feedback!</h3>
        <p className="text-sm text-gray-600 max-w-md">
          You rated this generated content {submittedRating} out of 5 stars. Your insights help us improve the quality of AI-generated PRDs, diagrams, and architectures.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mt-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
          <MessageSquareText className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 w-full">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Rate this AI-Generated Content</h3>
          <p className="text-sm text-gray-500 mb-4">
            How useful and accurate are the PRD requirements, UML diagrams, and architecture designs generated?
          </p>
          
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star 
                  className={`w-7 h-7 ${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                />
              </button>
            ))}
            <span className="ml-3 text-sm font-medium text-gray-600">
              {rating > 0 ? `${rating} of 5 stars` : 'Select a rating'}
            </span>
          </div>

          {rating > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Textarea
                placeholder="What did you like? What could be improved in the generated diagrams and text? (Optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] resize-y"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

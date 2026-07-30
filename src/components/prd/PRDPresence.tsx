import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
} from "firebase/firestore";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface PresenceData {
  userId: string;
  email: string;
  lastActive: any;
  currentSection: string;
}

export function PRDPresence({
  prdId,
  currentSection,
}: {
  prdId: string;
  currentSection: string;
}) {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<PresenceData[]>([]);

  useEffect(() => {
    if (!user || !prdId) return;

    const presenceRef = doc(db, `prds/${prdId}/presence/${user.uid}`);

    // Update presence
    const updatePresence = async () => {
      try {
        await setDoc(presenceRef, {
          userId: user.uid,
          email: user.email,
          lastActive: serverTimestamp(),
          currentSection: currentSection || "Viewing Document",
        });
      } catch (e) {
        console.error("Failed to update presence", e);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // 30s heartbeat

    const handleBeforeUnload = () => {
      deleteDoc(presenceRef);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      deleteDoc(presenceRef).catch(() => {});
    };
  }, [prdId, user, currentSection]);

  useEffect(() => {
    if (!prdId) return;
    const q = query(collection(db, `prds/${prdId}/presence`));
    const unsub = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const users: PresenceData[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as PresenceData;
        const lastActiveTime = data.lastActive?.toMillis?.() || 0;
        // Consider offline if inactive for > 60s
        if (now - lastActiveTime < 60000 && data.userId !== user?.uid) {
          users.push(data);
        }
      });
      setActiveUsers(users);
    });
    return unsub;
  }, [prdId, user]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 font-medium">
        Currently viewing:
      </span>
      <div className="flex -space-x-2">
        {activeUsers.map((u) => (
          <div
            key={u.userId}
            className="relative group"
            title={`${u.email} - ${u.currentSection}`}
          >
            <Avatar className="w-8 h-8 relative ring-2 ring-white border border-gray-200 shadow-sm cursor-help hover:z-10 transition-transform hover:scale-110">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                {u.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute top-2 w-2 h-2 bg-green-500 rounded-full border border-white right-0 z-10" />
            <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
              {u.email}
              <br />
              <span className="text-gray-400">Section: {u.currentSection}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

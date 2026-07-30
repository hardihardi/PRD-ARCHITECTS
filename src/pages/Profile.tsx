import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/LanguageContext";
import { auth, db, storage } from "../lib/firebase";
import { updateProfile } from "firebase/auth";
import { addDoc, collection, serverTimestamp, query, where, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserSquare, Mail, Camera, Save, Upload, Loader2, X } from "lucide-react";

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    photoURL: user?.photoURL || "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
      });
      setPreviewURL(user.photoURL || "");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("Mohon unggah file gambar yang valid (JPEG, PNG, WEBP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewURL(url);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewURL(profileData.photoURL);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSaving(true);
    setSuccessMsg("");

    try {
      let finalPhotoURL = profileData.photoURL;

      if (selectedFile) {
        const fileExtension = selectedFile.name.split('.').pop();
        const storageRef = ref(storage, `profiles/${auth.currentUser.uid}/profile_${Date.now()}.${fileExtension}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        finalPhotoURL = await getDownloadURL(snapshot.ref);
      }

      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: finalPhotoURL,
      });

      // Synchronize with app_users
      const q = query(collection(db, "app_users"), where("email", "==", auth.currentUser.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing user doc
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "app_users", userDoc.id), {
          name: profileData.displayName,
          photoURL: finalPhotoURL,
        });
      } else {
        // Create it if not exists
        await setDoc(doc(db, "app_users", auth.currentUser.uid), {
          name: profileData.displayName,
          email: auth.currentUser.email,
          photoURL: finalPhotoURL,
          role: "Viewer",
          createdAt: serverTimestamp(),
          uid: auth.currentUser.uid
        });
      }

      await addDoc(collection(db, "logs"), {
        action: "Updated Profile",
        details: "User updated their public profile and/or avatar.",
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Profil berhasil diperbarui!");
      setSelectedFile(null);
      setProfileData(prev => ({ ...prev, photoURL: finalPhotoURL }));
      setTimeout(() => {
        setSuccessMsg("");
        window.location.reload(); // Force reload to reflect across app
      }, 1500);
    } catch (e: any) {
      console.error(e);
      alert("Gagal memperbarui profil: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {t("header.editProfile")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium animate-in fade-in">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium leading-6 text-gray-900 flex items-center gap-2"
                >
                  <UserSquare className="w-4 h-4 text-gray-400" />
                  {t("users.fullNameLabel")}
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    required
                    value={profileData.displayName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        displayName: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-gray-400" />
                  {t("users.emailLabel")}
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    disabled
                    value={user?.email || ""}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 px-3 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center md:items-start w-full md:w-auto">
              <label className="block text-sm font-medium leading-6 text-gray-900 flex items-center gap-2 mb-4 self-start">
                <Camera className="w-4 h-4 text-gray-400" />
                {t("settings.logoFavicon.logoLabel")}
              </label>
              
              <div className="flex flex-col items-center gap-y-4 w-full md:w-48">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    {previewURL ? (
                      <img
                        src={previewURL}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        className="h-12 w-12 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Overlay for hover */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-white text-xs font-medium">{t("common.edit")}</span>
                  </div>

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedFile();
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                      title={t("common.delete")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="w-full text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition w-full justify-center"
                  >
                    <Upload className="w-4 h-4 text-gray-500" />
                    {t("settings.logoFavicon.uploadLogo")}
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-500">
                    Format: JPG, PNG, WEBP (Max: 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("common.save")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      localStorage.setItem("uploadedImage", data.filename);

      router.push("/questionnaire");
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-6">

      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl">

        <h1 className="text-4xl font-bold text-center text-pink-600">
          Upload Your Selfie
        </h1>

        <p className="text-center text-gray-500 mt-3">
          Upload a clear face photo for AI skin analysis.
        </p>

        <div className="mt-10">

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded-xl p-3"
          />

        </div>

        {preview && (
          <div className="mt-8">

            <img
              src={preview}
              alt="Preview"
              className="rounded-2xl w-full h-[420px] object-cover shadow-lg"
            />

          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full mt-8 bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl text-lg font-semibold transition disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Analyze Skin"}
        </button>

      </div>

    </main>
  );
}
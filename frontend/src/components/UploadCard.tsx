"use client";

import { useState } from "react";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function UploadCard() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setIsAnalyzing(true);

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);
      // Save uploaded image name
      localStorage.setItem("uploadedImage", response.data.image);
      router.push("/results");
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");
    } finally {
      setIsAnalyzing(false);

    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-pink-300 transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Upload Your Selfie 📷
      </h2>

      <div className="border-2 border-dashed border-pink-300 rounded-2xl p-10 text-center">
        {preview ? (
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="Preview"
              className="w-64 h-64 object-cover rounded-2xl shadow-lg"
            />

            <button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
              className="mt-6 flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <FaTrash />
              Remove Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaCloudUploadAlt className="text-6xl text-pink-500 mb-4" />

            <p className="text-gray-600">
              Drag & Drop your image here
            </p>

            <p className="my-4 text-gray-400">or</p>

            <label className="bg-pink-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-pink-700 transition">
              Choose Image

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!selectedFile || isAnalyzing}
        className={`w-full mt-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
          selectedFile && !isAnalyzing
            ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </div>
        ) : (
          "Analyze Skin"
        )}
      </button>
    </div>
  );
}
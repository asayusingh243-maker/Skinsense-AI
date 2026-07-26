"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FaCamera,
  FaCloudUploadAlt,
  FaRedo,
  FaTrash,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ImageSource = "upload" | "camera" | null;

export default function UploadCard() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const previewUrlRef =
    useRef<string | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [imageSource, setImageSource] =
    useState<ImageSource>(null);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraStarting, setCameraStarting] =
    useState(false);

  const [cameraStream, setCameraStream] =
    useState<MediaStream | null>(null);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current = null;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStream(null);
    setCameraOpen(false);
    setCameraStarting(false);
  };

  const clearImage = () => {
    revokePreviewUrl();

    setSelectedFile(null);
    setPreview(null);
    setImageSource(null);
  };

  const selectImage = (
    file: File,
    source: ImageSource
  ) => {
    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        "Please select an image smaller than 10 MB."
      );
      return;
    }

    revokePreviewUrl();

    const previewUrl =
      URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setSelectedFile(file);
    setPreview(previewUrl);
    setImageSource(source);
  };

  useEffect(() => {
    if (
      cameraOpen &&
      cameraStream &&
      videoRef.current
    ) {
      videoRef.current.srcObject =
        cameraStream;

      videoRef.current
        .play()
        .catch((error) => {
          console.error(
            "Camera playback error:",
            error
          );
        });
    }
  }, [cameraOpen, cameraStream]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }
    };
  }, []);

  const openFilePicker = () => {
    stopCamera();
    fileInputRef.current?.click();
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    stopCamera();
    selectImage(file, "upload");
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    stopCamera();
    selectImage(file, "upload");
  };

  const startCamera = async () => {
    stopCamera();
    clearImage();

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      toast.error(
        "Your browser does not support camera access."
      );
      return;
    }

    try {
      setCameraStarting(true);
      setCameraOpen(true);

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "user",
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 1280,
              },
            },
            audio: false,
          }
        );

      streamRef.current = stream;
      setCameraStream(stream);
      setCameraStarting(false);
    } catch (error) {
      console.error(
        "Camera access error:",
        error
      );

      stopCamera();

      if (
        error instanceof DOMException &&
        error.name === "NotAllowedError"
      ) {
        toast.error(
          "Camera permission was denied. Please allow camera access."
        );
      } else if (
        error instanceof DOMException &&
        error.name === "NotFoundError"
      ) {
        toast.error(
          "No camera was found on this device."
        );
      } else {
        toast.error(
          "Unable to open the camera."
        );
      }
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      toast.error(
        "The camera is not ready."
      );
      return;
    }

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      toast.error(
        "Please wait for the camera to finish loading."
      );
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      toast.error(
        "Unable to capture the photo."
      );
      return;
    }

    /*
      Mirror the captured image so it matches
      the front-camera preview.
    */
    context.translate(
      canvas.width,
      0
    );

    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.setTransform(
      1,
      0,
      0,
      1,
      0,
      0
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error(
            "Unable to capture the photo."
          );
          return;
        }

        const capturedFile =
          new File(
            [blob],
            `skinsense-selfie-${Date.now()}.jpg`,
            {
              type: "image/jpeg",
            }
          );

        stopCamera();

        selectImage(
          capturedFile,
          "camera"
        );

        toast.success(
          "Photo captured successfully!"
        );
      },
      "image/jpeg",
      0.92
    );
  };

  const handleRetake = async () => {
    clearImage();
    await startCamera();
  };

  const handleRemove = () => {
    stopCamera();
    clearImage();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error(
        "Please upload or capture a selfie."
      );
      return;
    }

    try {
      setIsAnalyzing(true);

      const formData = new FormData();

      formData.append(
        "image",
        selectedFile
      );

      const response = await axios.post(
        `${API_URL}/api/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const uploadedImage =
        response.data.image ||
        response.data.filename ||
        response.data.imageName;

      if (
        !response.data.success ||
        !uploadedImage
      ) {
        throw new Error(
          response.data.message ||
            "The server did not return the uploaded image name."
        );
      }

      localStorage.setItem(
        "uploadedImage",
        uploadedImage
      );

      if (response.data.imagePath) {
        localStorage.setItem(
          "uploadedImagePath",
          response.data.imagePath
        );
      }

      toast.success(
        response.data.message ||
          "Selfie uploaded successfully!"
      );

      /*
        Continue to the questionnaire before
        generating the final AI results.
      */
      router.push("/questionnaire");
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Image upload failed."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Image upload failed."
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-pink-300 sm:p-8">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">
        Upload Your Selfie 📷
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Upload a clear image or capture a
        selfie using your camera.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="rounded-2xl border-2 border-dashed border-pink-300 p-5 text-center sm:p-10"
      >
        {cameraOpen ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-gray-950 shadow-lg">
              {cameraStarting && (
                <div className="flex h-80 items-center justify-center text-white">
                  <div>
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                    <p className="mt-4">
                      Opening camera...
                    </p>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-80 w-full scale-x-[-1] object-cover ${
                  cameraStarting
                    ? "hidden"
                    : "block"
                }`}
              />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Face the camera directly and use
              natural lighting.
            </p>

            <div className="mt-6 flex w-full flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={cameraStarting}
                className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <FaCamera />
                Capture Photo
              </button>
            </div>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={preview}
                alt="Selected selfie preview"
                className="h-72 w-72 rounded-2xl object-cover shadow-lg"
              />

              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                {imageSource === "camera"
                  ? "Camera photo"
                  : "Uploaded photo"}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {imageSource === "camera" ? (
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
                >
                  <FaRedo />
                  Retake
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
                >
                  <FaCloudUploadAlt />
                  Choose Another
                </button>
              )}

              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                <FaTrash />
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaCloudUploadAlt className="mb-4 text-6xl text-pink-500" />

            <p className="font-medium text-gray-700">
              Drag and drop your image here
            </p>

            <p className="my-4 text-gray-400">
              or choose an option
            </p>

            <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={openFilePicker}
                className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
              >
                <FaCloudUploadAlt />
                Choose Image
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
              >
                <FaCamera />
                Use Camera
              </button>
            </div>

            <p className="mt-5 text-xs text-gray-400">
              JPG, PNG or WEBP · Maximum size
              10 MB
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={
          !selectedFile ||
          isAnalyzing ||
          cameraOpen
        }
        className={`mt-6 w-full rounded-xl py-3 font-semibold text-white transition-all duration-300 ${
          selectedFile &&
          !isAnalyzing &&
          !cameraOpen
            ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-[1.01]"
            : "cursor-not-allowed bg-gray-400"
        }`}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Uploading...
          </span>
        ) : (
          "Analyze Skin"
        )}
      </button>
    </section>
  );
}
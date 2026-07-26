"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type ImageSource = "upload" | "camera" | "captured" | null;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AnalyzePage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageSource, setImageSource] =
    useState<ImageSource>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const clearSelectedImage = () => {
    revokePreviewUrl();
    setImage(null);
    setPreview(null);
  };

  const setSelectedImage = (
    file: File,
    source: "upload" | "captured"
  ) => {
    revokePreviewUrl();

    const newPreviewUrl = URL.createObjectURL(file);

    previewUrlRef.current = newPreviewUrl;

    setImage(file);
    setPreview(newPreviewUrl);
    setImageSource(source);
    setError(null);
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

    setCameraReady(false);
    setCameraStarting(false);
  };

  useEffect(() => {
    if (
      imageSource === "camera" &&
      cameraReady &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.play().catch((playError) => {
        console.error("Could not play camera stream:", playError);
      });
    }
  }, [imageSource, cameraReady]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const openFilePicker = () => {
    stopCamera();
    setError(null);
    fileInputRef.current?.click();
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Please choose an image smaller than 10 MB.");
      return;
    }

    stopCamera();
    setSelectedImage(file, "upload");
  };

  const startCamera = async () => {
    setError(null);
    stopCamera();
    clearSelectedImage();

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setError(
        "Your browser does not support camera access. Please upload a photo instead."
      );
      return;
    }

    setImageSource("camera");
    setCameraStarting(true);

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
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
        });

      streamRef.current = stream;
      setCameraReady(true);
      setCameraStarting(false);
    } catch (cameraError) {
      console.error("Camera access error:", cameraError);

      stopCamera();
      setImageSource(null);

      if (
        cameraError instanceof DOMException &&
        cameraError.name === "NotAllowedError"
      ) {
        setError(
          "Camera permission was denied. Allow camera access in your browser or upload a photo instead."
        );
      } else if (
        cameraError instanceof DOMException &&
        cameraError.name === "NotFoundError"
      ) {
        setError(
          "No camera was found on this device. Please upload a photo instead."
        );
      } else {
        setError(
          "The camera could not be opened. Please check your browser permissions."
        );
      }
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("The camera is not ready yet.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError(
        "Please wait a moment for the camera to finish loading."
      );
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("The photo could not be captured.");
      return;
    }

    /*
      Mirror the captured selfie so it matches the live
      front-camera preview shown to the user.
    */
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.setTransform(1, 0, 0, 1, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("The photo could not be captured.");
          return;
        }

        const capturedFile = new File(
          [blob],
          `skinsense-selfie-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        stopCamera();
        setSelectedImage(capturedFile, "captured");
      },
      "image/jpeg",
      0.92
    );
  };

  const retakePhoto = async () => {
    clearSelectedImage();
    await startCamera();
  };

  const removeImage = () => {
    stopCamera();
    clearSelectedImage();
    setImageSource(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!image) {
      setError(
        "Please upload or capture a selfie before continuing."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch(
        "http://localhost:5000/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "The image upload failed."
        );
      }

      /*
        Supports both the older `filename` response and the
        newer `image` response from uploadController.
      */
      const uploadedImage =
        data.filename || data.image || data.imageName;

      if (!uploadedImage) {
        throw new Error(
          "The server did not return the uploaded image name."
        );
      }

      localStorage.setItem(
        "uploadedImage",
        uploadedImage
      );

      if (data.imagePath) {
        localStorage.setItem(
          "uploadedImagePath",
          data.imagePath
        );
      }

      router.push("/questionnaire");
    } catch (uploadError) {
      console.error("Upload error:", uploadError);

      if (uploadError instanceof TypeError) {
        setError(
          "Could not connect to the backend. Make sure the backend server is running on port 5000."
        );
      } else {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "The image upload failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-pink-100 bg-white p-6 shadow-2xl sm:p-10">
        <div className="text-center">
          <p className="mb-3 inline-flex rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-600">
            AI-Powered Skin Analysis
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Add Your Selfie
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Upload a clear photo or use your camera. For the
            best result, face the camera directly and use
            natural lighting.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleImageChange}
          className="hidden"
        />

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={loading || cameraStarting}
            className="flex min-h-28 items-center justify-center gap-3 rounded-2xl border-2 border-pink-200 bg-pink-50 px-5 py-5 font-semibold text-pink-700 transition hover:border-pink-400 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="text-3xl"
            >
              🖼️
            </span>

            <span className="text-left">
              <span className="block text-lg">
                Upload Photo
              </span>

              <span className="block text-sm font-normal text-gray-500">
                Choose an image from your device
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={startCamera}
            disabled={loading || cameraStarting}
            className="flex min-h-28 items-center justify-center gap-3 rounded-2xl border-2 border-purple-200 bg-purple-50 px-5 py-5 font-semibold text-purple-700 transition hover:border-purple-400 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="text-3xl"
            >
              📷
            </span>

            <span className="text-left">
              <span className="block text-lg">
                {cameraStarting
                  ? "Opening Camera..."
                  : "Use Camera"}
              </span>

              <span className="block text-sm font-normal text-gray-500">
                Capture a selfie using your camera
              </span>
            </span>
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {imageSource === "camera" && (
          <section className="mt-8">
            <div className="overflow-hidden rounded-3xl bg-gray-950 shadow-xl">
              {cameraStarting && (
                <div className="flex h-[420px] items-center justify-center text-white">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                    <p className="mt-4">
                      Waiting for camera permission...
                    </p>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-[420px] w-full scale-x-[-1] object-cover ${
                  cameraStarting ? "hidden" : "block"
                }`}
              />
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Position your full face inside the frame and
              keep your expression neutral.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setImageSource(null);
                }}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraReady || cameraStarting}
                className="w-full rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Capture Photo
              </button>
            </div>
          </section>
        )}

        {preview && imageSource !== "camera" && (
          <section className="mt-8">
            <div className="relative overflow-hidden rounded-3xl border border-pink-100 bg-gray-100 shadow-lg">
              <img
                src={preview}
                alt="Selected selfie preview"
                className="h-[420px] w-full object-cover"
              />

              <div className="absolute left-4 top-4 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                {imageSource === "captured"
                  ? "Camera photo"
                  : "Uploaded photo"}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {imageSource === "captured" ? (
                <button
                  type="button"
                  onClick={retakePhoto}
                  disabled={loading}
                  className="w-full rounded-xl border border-pink-300 px-5 py-3 font-semibold text-pink-700 transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Retake Photo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={loading}
                  className="w-full rounded-xl border border-pink-300 px-5 py-3 font-semibold text-pink-700 transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Choose Another Photo
                </button>
              )}

              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || !image}
              className="mt-4 w-full rounded-xl bg-pink-600 py-4 text-lg font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
            >
              {loading
                ? "Uploading..."
                : imageSource === "captured"
                  ? "Use Photo & Continue"
                  : "Analyze Skin"}
            </button>
          </section>
        )}

        {!preview && imageSource !== "camera" && (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
            <p className="font-medium text-gray-700">
              No selfie selected
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Supported formats include JPG, JPEG, PNG and
              WEBP. Maximum file size: 10 MB.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-3 rounded-2xl bg-pink-50 p-5 text-sm text-gray-600 sm:grid-cols-3">
          <p className="text-center">
            ☀️ Use natural lighting
          </p>

          <p className="text-center">
            🙂 Keep your face visible
          </p>

          <p className="text-center">
            🚫 Avoid beauty filters
          </p>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DR_CLASSES = [
  {
    name: "No_DR",
    label: "No DR",
    color: "bg-emerald-500",
    textColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-500",
    description:
      "Tidak ada tanda Diabetic Retinopathy terdeteksi. Retina dalam kondisi sehat.",
  },
  {
    name: "Mild",
    label: "Mild",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-500",
    description:
      "Tahap awal dengan microaneurysms. Disarankan untuk pemeriksaan rutin setiap 12 bulan.",
  },
  {
    name: "Moderate",
    label: "Moderate",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
    description:
      "Tahap menengah. Perlu pemantauan lebih intensif dan konsultasi dengan dokter mata.",
  },
  {
    name: "Severe",
    label: "Severe",
    color: "bg-red-500",
    textColor: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    description:
      "Tahap lanjut. Segera konsultasikan dengan dokter mata spesialis untuk penanganan.",
  },
  {
    name: "Proliferate_DR",
    label: "Proliferate DR",
    color: "bg-red-800",
    textColor: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-800",
    description:
      "Tahap paling parah. Memerlukan penanganan medis segera untuk mencegah kebutaan.",
  },
];

export default function ClassifyPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ✅ Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(
          `File terlalu besar (${(file.size / (1024 * 1024)).toFixed(
            2
          )}MB). Maksimal 10MB.`
        );
        return;
      }

      // ✅ Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/bmp"];
      if (!validTypes.includes(file.type)) {
        setError(`Format file tidak didukung. Gunakan PNG, JPG, atau BMP.`);
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
      // ✅ Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(
          `File terlalu besar (${(file.size / (1024 * 1024)).toFixed(
            2
          )}MB). Maksimal 10MB.`
        );
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    } else {
      setError("Format file tidak valid. Upload gambar (PNG, JPG, BMP).");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClassify = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedImage); // ✅ Key: "image" (match backend)

    try {
      console.log("📤 Sending request to backend...");
      console.log(`   File: ${selectedImage.name}`);
      console.log(`   Size: ${(selectedImage.size / 1024).toFixed(2)} KB`);

      const response = await fetch("http://localhost:5500/api/classify", {
        method: "POST",
        body: formData,
      });

      console.log(`📥 Response status: ${response.status}`);

      // ✅ Parse JSON response
      const data = await response.json();

      // ✅ Check if response is successful
      if (!response.ok) {
        // Backend returned error
        throw new Error(
          data.message || data.error || "Terjadi kesalahan saat klasifikasi"
        );
      }

      // ✅ Check if prediction was successful
      if (!data.success) {
        throw new Error(data.message || "Klasifikasi gagal");
      }

      console.log("✅ Prediction successful:", data);
      setResult(data);
    } catch (err) {
      console.error("❌ Classification error:", err);

      // ✅ Better error messages
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        setError(
          "Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5500"
        );
      } else {
        setError(err.message || "Gagal melakukan klasifikasi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentClass = result ? DR_CLASSES[result.predicted_class] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <main className="flex-1 pt-36 pb-18">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block bg-teal-100 text-teal-700 px-5 py-2 rounded-full text-sm font-semibold mb-4">
              AI-Powered Analysis
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Klasifikasi Diabetic Retinopathy
            </h1>
            <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
              Upload gambar fundus mata untuk mendapatkan hasil analisis dengan
              confidence score dan uncertainty estimation.
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upload Gambar Fundus
                </h2>
                <p className="text-sm text-slate-500">
                  Pilih atau drag & drop gambar retina
                </p>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                imagePreview
                  ? "border-teal-500 bg-teal-50/50"
                  : "border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-72 max-w-full mx-auto rounded-xl shadow-lg"
                  />
                  <p className="text-sm text-teal-600 mt-4 font-medium">
                    ✓ {selectedImage?.name} (
                    {(selectedImage?.size / 1024).toFixed(0)} KB)
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mb-5">
                    <svg
                      className="w-8 h-8 text-teal-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-900 font-semibold text-base mb-2">
                    Klik atau drag & drop gambar di sini
                  </p>
                  <p className="text-sm text-slate-500">
                    Format: PNG, JPG, JPEG (maks. 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClassify}
                disabled={!selectedImage || isLoading}
                className={`flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-base transition-all ${
                  !selectedImage || isLoading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Mulai Klasifikasi
                  </>
                )}
              </button>
              {selectedImage && (
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className={`py-4 px-6 rounded-xl font-semibold text-base border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all ${
                    isLoading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          {(isLoading || result) && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Hasil Analisis
                  </h2>
                  <p className="text-sm text-slate-500">
                    Klasifikasi Diabetic Retinopathy
                  </p>
                </div>
              </div>

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-14 h-14 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-5"></div>
                  <p className="text-slate-900 font-semibold">
                    Menganalisis gambar...
                  </p>
                  <p className="text-slate-500 text-sm">
                    Menjalankan 30 iterasi Monte Carlo Dropout
                  </p>
                </div>
              )}

              {result && currentClass && (
                <div className="space-y-5">
                  {/* Image + Prediction Row */}
                  <div className="flex gap-5 items-center">
                    {imagePreview && (
                      <div className="p-3 bg-slate-100 rounded-2xl">
                        <img
                          src={imagePreview}
                          alt="Analyzed"
                          className="w-28 h-28 object-cover rounded-xl shadow-md"
                        />
                      </div>
                    )}
                    <div
                      className={`flex-1 p-5 rounded-2xl ${currentClass.bgColor} border-2 ${currentClass.borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500 font-medium mb-1">
                            Hasil Prediksi
                          </p>
                          <p
                            className={`text-3xl font-extrabold ${currentClass.textColor}`}
                          >
                            {currentClass.label}
                          </p>
                        </div>
                        <div className="text-center bg-white px-5 py-3 rounded-xl shadow-sm">
                          <p className="text-xs text-slate-500 font-medium mb-0.5">
                            Confidence
                          </p>
                          <p className="text-2xl font-extrabold text-slate-900">
                            {(result.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div
                    className={`p-4 bg-slate-50 rounded-xl border-l-4 ${currentClass.borderColor}`}
                  >
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {currentClass.description}
                    </p>
                  </div>

                  {/* ✅ Reliability Badge */}
                  {result.reliable_prediction !== undefined && (
                    <div
                      className={`p-4 rounded-xl ${
                        result.reliable_prediction
                          ? "bg-green-50 border border-green-200"
                          : "bg-yellow-50 border border-yellow-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {result.reliable_prediction ? (
                          <>
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm font-semibold text-green-700">
                              Prediksi Reliable
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 text-yellow-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <span className="text-sm font-semibold text-yellow-700">
                              Prediksi Perlu Verifikasi
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Uncertainty */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-blue-700 font-semibold">
                          Uncertainty (σ)
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          Level: {result.uncertainty_level || "N/A"}
                        </p>
                      </div>
                      <span className="text-2xl font-extrabold text-blue-700">
                        {result.uncertainty?.toFixed(4) || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Probability Distribution */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4">
                      Distribusi Probabilitas
                    </h3>
                    <div className="space-y-3">
                      {result.probabilities?.map((prob, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span
                              className={`font-semibold ${DR_CLASSES[idx].textColor}`}
                            >
                              {DR_CLASSES[idx].label}
                            </span>
                            <span className="text-slate-600 font-semibold">
                              {(prob * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${DR_CLASSES[idx].color} rounded-full transition-all duration-500`}
                              style={{ width: `${prob * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

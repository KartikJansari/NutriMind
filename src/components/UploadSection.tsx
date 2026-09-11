import React, { useState, useRef } from "react";
import { Upload, Camera, Image as ImageIcon, Zap, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UploadSectionProps {
  onAnalyze: (payload: { image?: string; mimeType?: string; sampleUrl?: string }, originalSource: string) => void;
  isAnalyzing: boolean;
}

const PRESET_MEALS = [
  {
    id: "avocado-toast",
    name: "Avocado Toast & Egg",
    description: "Sourdough, fresh avocado, poached egg",
    url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "garden-salad",
    name: "Healthy Garden Salad",
    description: "Mixed greens, tomatoes, olive dressing",
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "grilled-salmon",
    name: "Herbed Salmon & Asparagus",
    description: "Salmon steak, roasted greens, lemon zest",
    url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "pepperoni-pizza",
    name: "Pepperoni Pizza Slice",
    description: "Classic hand-tossed cheese & pepperoni",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
  }
];

export default function UploadSection({ onAnalyze, isAnalyzing }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle Drag & Drop Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract pure base64 without prefix data:image/png;base64,
      const pureBase64 = base64String.split(",")[1];
      onAnalyze({ image: pureBase64, mimeType: file.type }, base64String);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Camera logic
  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError("Camera access denied or unavailable. Please upload a photo instead.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      const pureBase64 = dataUrl.split(",")[1];
      
      stopCamera();
      onAnalyze({ image: pureBase64, mimeType: "image/jpeg" }, dataUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box Container */}
      <div 
        className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden p-6"
      >
        <h3 className="font-display font-semibold text-base text-slate-800 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-brand-500" />
          Upload Food Image
        </h3>

        <AnimatePresence mode="wait">
          {!showCamera ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Drag Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-brand-500 bg-brand-50/30 scale-[0.99]" 
                    : "border-slate-200 hover:border-brand-400 hover:bg-slate-50/50"
                } ${isAnalyzing ? "pointer-events-none opacity-50" : ""}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="p-4 bg-brand-50 rounded-2xl text-brand-500 mb-4 shadow-sm shadow-brand-500/10">
                  <Upload className="w-6 h-6" />
                </div>

                <p className="font-display font-semibold text-sm text-slate-700">
                  Drag and drop your food photo here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPEG, PNG, or WEBP (Max 10MB)
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-200 transition-all">
                    Browse Files
                  </span>
                </div>
              </div>

              {/* Take snapshot and error display */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={startCamera}
                  disabled={isAnalyzing}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-xs py-3 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-slate-950/10 active:scale-98 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo with Camera
                </button>

                {cameraError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="camera-feed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              {/* Video elements */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute top-3 left-3 bg-red-500 text-white font-mono font-bold text-[9px] px-2 py-1 rounded-md tracking-wider flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE PREVIEW
                </div>
              </div>

              {/* Camera Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={stopCamera}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs py-3 cursor-pointer transition-all active:scale-98"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs py-3 cursor-pointer shadow-md shadow-brand-500/10 transition-all active:scale-98"
                >
                  Capture Food Item
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preset Cards Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 space-y-4">
        <div>
          <h4 className="font-display font-semibold text-sm text-slate-800 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand-500" />
            Quick Test Presets
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Don't have a photo? Select a classic dish to experience the breakdown instantly.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PRESET_MEALS.map((meal) => (
            <button
              id={`preset-${meal.id}`}
              key={meal.id}
              disabled={isAnalyzing}
              onClick={() => onAnalyze({ sampleUrl: meal.url }, meal.url)}
              className="text-left bg-slate-50/50 hover:bg-white rounded-2xl p-3 border border-slate-100 hover:border-brand-200 transition-all cursor-pointer group hover:shadow-lg hover:shadow-slate-100/70 disabled:opacity-50 disabled:pointer-events-none flex gap-3 flex-shrink-0"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-100">
                <img
                  src={meal.url}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h5 className="font-display font-semibold text-xs text-slate-800 line-clamp-1 group-hover:text-brand-700 transition-colors">
                  {meal.name}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {meal.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

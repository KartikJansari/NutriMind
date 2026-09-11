import React, { useState, useEffect } from "react";
import { AnalysisResult, HistoryItem } from "./types";
import UploadSection from "./components/UploadSection";
import ReportViewer from "./components/ReportViewer";
import { 
  Apple, BrainCircuit, History, Trash2, ShieldCheck, Heart, Sparkles, 
  HelpCircle, ChevronRight, Activity, MessageSquareHeart, RefreshCw, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{
    payload: { image?: string; mimeType?: string; sampleUrl?: string };
    originalSource: string;
  } | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nutrimind_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        if (parsed.length > 0) {
          setSelectedResult(parsed[0].result);
          setSelectedImage(parsed[0].image);
        }
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("nutrimind_history", JSON.stringify(newHistory));
  };

  // Delete history item
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
    
    // If the currently selected item is deleted, select the first remaining or null
    const currentSelectedInHistory = history.find(item => item.result === selectedResult);
    if (currentSelectedInHistory && currentSelectedInHistory.id === id) {
      if (updated.length > 0) {
        setSelectedResult(updated[0].result);
        setSelectedImage(updated[0].image);
      } else {
        setSelectedResult(null);
        setSelectedImage(undefined);
      }
    }
  };

  // Loading screen step messages
  useEffect(() => {
    if (!isAnalyzing) return;

    const steps = [
      "Uploading food photo to NutriMind engine...",
      "Detecting visual features & plating textures...",
      "Estimating portion weights & food composition...",
      "Calculating clinical calorie and macronutrient distributions...",
      "Analyzing micro-nutritional properties & vitamins...",
      "Generating empathetic and positive health assessments...",
      "Formulating a targeted, actionable lifestyle tip..."
    ];

    let currentIdx = 0;
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % steps.length;
      setLoadingStep(steps[currentIdx]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle analysis triggering
  const handleAnalyze = async (
    payload: { image?: string; mimeType?: string; sampleUrl?: string },
    originalSource: string // base64 or sample URL to store in history preview
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setLastRequest({ payload, originalSource });
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned error status ${response.status}`);
      }

      const result: AnalysisResult = await response.json();
      setSelectedResult(result);
      setSelectedImage(originalSource);
      setLastRequest(null);

      // Save to history
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " · " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
        image: originalSource,
        mimeType: payload.mimeType || "image/jpeg",
        result
      };

      const updatedHistory = [newItem, ...history];
      saveHistory(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedResult(item.result);
    setSelectedImage(item.image);
    setError(null);
    setLastRequest(null);
    
    // Scroll to report on mobile
    const reportEl = document.getElementById("report-root");
    if (reportEl) {
      reportEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStartNew = () => {
    setSelectedResult(null);
    setSelectedImage(undefined);
    setError(null);
    setLastRequest(null);
  };

  return (
    <div id="nutrimind-app" className="min-h-screen bg-emerald-50 text-stone-800 flex flex-col antialiased">
      {/* Header Bar styled perfectly to theme */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
              <Apple className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-emerald-900 tracking-tight leading-none">
                NutriMind <span className="font-normal text-emerald-600">AI</span>
              </h1>
              <p className="text-[10px] text-emerald-700/80 font-mono tracking-wider uppercase mt-1">EMPATHETIC NUTRITIONAL ENGINE</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicator derived from Design HTML */}
            <div className="flex items-center space-x-3 bg-white/60 px-4 py-2 rounded-full border border-emerald-100 shadow-xs">
              <div className={`w-2 h-2 rounded-full ${isAnalyzing ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-ping"}`}></div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
                {isAnalyzing ? "Analyzing Meal..." : selectedResult ? "Analysis Complete" : "Engine Ready"}
              </span>
            </div>

            {selectedResult && (
              <button
                id="btn-analyze-another"
                onClick={handleStartNew}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs px-4 py-2.5 cursor-pointer shadow-md shadow-emerald-900/10 transition-all hover:scale-102 active:scale-98"
              >
                New Assessment
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Actions & History */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upload/Capture interface */}
            <UploadSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

            {/* Analysis History Side Panel in Beautiful Emerald Theme */}
            <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  Meal History
                </h4>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50">
                  {history.length} assessment{history.length !== 1 && "s"}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {history.map((item) => {
                  const isSelected = selectedResult?.foodIdentification.dishName === item.result.foodIdentification.dishName;
                  return (
                    <div
                      id={`history-${item.id}`}
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                        isSelected 
                          ? "bg-emerald-50/70 border-emerald-200 shadow-xs" 
                          : "bg-stone-50/50 hover:bg-stone-50 border-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-100/40 bg-white flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.result.foodIdentification.dishName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className={`font-display font-bold text-xs truncate ${isSelected ? "text-emerald-900" : "text-stone-700"}`}>
                            {item.result.foodIdentification.dishName}
                          </h5>
                          <p className="text-[9px] text-stone-400 mt-0.5 truncate font-mono">
                            {item.timestamp}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          item.result.healthAssessment.score >= 8 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : item.result.healthAssessment.score >= 5 
                              ? "bg-amber-50 text-amber-700 border border-amber-100" 
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {item.result.healthAssessment.score}/10
                        </span>

                        <button
                          id={`btn-delete-history-${item.id}`}
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Delete assessment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {history.length === 0 && (
                  <div className="text-center py-8 px-4 border border-dashed border-emerald-200/60 rounded-2xl bg-emerald-50/20">
                    <p className="text-xs text-emerald-800/60 font-medium">Your nutrition logs will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Loading / Report Viewer / Empty State */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                /* Beautiful Dynamic Loading State */
                <motion.div
                  key="loader-container"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[500px]"
                >
                  <div className="relative mb-6">
                    {/* Ring animation */}
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="w-8 h-8 text-emerald-600 animate-pulse" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-emerald-950">NutriMind Analysis In Progress</h3>
                  <div className="h-6 mt-2 overflow-hidden flex items-center justify-center max-w-sm">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs sm:text-sm text-emerald-700 font-bold font-mono uppercase tracking-wider"
                      >
                        {loadingStep}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <p className="text-stone-400 text-xs mt-4 leading-relaxed max-w-xs">
                    Please hold on. Our neural health system is conducting a meticulous visual assessment of your meal ingredients.
                  </p>
                </motion.div>
              ) : error ? (
                /* Error State */
                <motion.div
                  key="error-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-[2rem] border border-rose-100 shadow-sm p-8 flex flex-col items-center text-center min-h-[400px] justify-center"
                >
                  <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl mb-4 border border-rose-100">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-stone-800">Analysis Unsuccessful</h4>
                  <p className="text-xs text-rose-700 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100/60 max-w-md mt-2 leading-relaxed">
                    {error}
                  </p>
                  <p className="text-slate-500 text-xs mt-3 max-w-xs leading-relaxed">
                    High demand or network interruptions are usually temporary. You can immediately retry the analysis.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {lastRequest && (
                      <button
                        onClick={() => handleAnalyze(lastRequest.payload, lastRequest.originalSource)}
                        className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl text-xs px-5 py-2.5 cursor-pointer shadow-md transition-all hover:scale-102 active:scale-98"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Analysis
                      </button>
                    )}
                    <button
                      onClick={handleStartNew}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-xs px-5 py-2.5 cursor-pointer transition-all hover:scale-102 active:scale-98"
                    >
                      Reset & Try Another
                    </button>
                  </div>
                </motion.div>
              ) : selectedResult ? (
                /* Report display */
                <motion.div
                  key="report-container"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReportViewer result={selectedResult} imageUrl={selectedImage} />
                </motion.div>
              ) : (
                /* Splendid Empty State */
                <motion.div
                  key="empty-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm p-8 sm:p-12 text-center min-h-[550px] flex flex-col items-center justify-center space-y-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-100/40 rounded-full blur-3xl scale-125" />
                    <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-md relative">
                      <BrainCircuit className="w-12 h-12" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h3 className="font-display font-black text-2xl text-emerald-950 tracking-tight leading-none">
                      Interactive AI Nutrition Analysis
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                      Transform any snapshot of a breakfast, lunch, dinner, or beverage into a fully structured, clinical nutritional breakdown.
                    </p>
                  </div>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-4 text-left">
                    <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/40 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                      <div>
                        <h5 className="font-display font-bold text-xs text-stone-800">Complete Portions & Dish IDs</h5>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">High-precision estimates of dish components and volume weights.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/40 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                      <div>
                        <h5 className="font-display font-bold text-xs text-stone-800">Bento Nutritional Profile</h5>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">Granular calculations of net carbs, fiber, fats, and protein percentages.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/40 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                      <div>
                        <h5 className="font-display font-bold text-xs text-stone-800">NutriMind Health Score</h5>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">A reliable scale (1-10) assessing nutrient density and food processing levels.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/40 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-lime-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                      <div>
                        <h5 className="font-display font-bold text-xs text-stone-800">Actionable Dietary Tips</h5>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">Smart, empathetic, highly personalized strategies to optimize your meals.</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-800 font-mono flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    UPLOAD A MEAL PHOTO OR SELECT A PRESET SHORTCUT TO BEGIN.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="mt-auto bg-white border-t border-emerald-100 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 text-[11px] text-emerald-800 space-y-1">
          <p className="font-bold">NutriMind AI — Advanced Clinical Nutritional Analyst</p>
          <p className="max-w-xl mx-auto leading-normal text-stone-500">
            Disclaimer: All nutritional values, macronutrients, portion estimations, and health scores provided by NutriMind are scientific AI estimations. This information is intended for educational and wellness tracking purposes and should not replace professional medical or clinical dietetic consultation.
          </p>
        </div>
      </footer>
    </div>
  );
}

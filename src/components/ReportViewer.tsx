import React, { useState } from "react";
import { AnalysisResult } from "../types";
import { 
  Copy, Check, Sparkles, Award, Zap, Apple, Flame, Layers, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReportViewerProps {
  result: AnalysisResult;
  imageUrl?: string;
}

export default function ReportViewer({ result, imageUrl }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "markdown">("dashboard");
  const [copied, setCopied] = useState(false);

  const { foodIdentification, nutritionalProfile, healthAssessment, properties, actionableTip } = result;

  // Format the exact requested Markdown format
  const requestedMarkdown = `### 1. Food Identification
* **Identified Dish/Items:** ${foodIdentification.dishName}
* **Estimated Portion Size:** ${foodIdentification.portionSize}

### 2. Nutritional Profile (Estimated)
Provide a breakdown of the standard macronutrients for this estimated portion:
* **Calories:** ${nutritionalProfile.calories} kcal
* **Protein:** ${nutritionalProfile.protein}g
* **Carbohydrates:** ${nutritionalProfile.carbohydrates}g
* **Fats:** ${nutritionalProfile.fats}g
* **Fiber:** ${nutritionalProfile.fiber}g

### 3. Health Assessment & "Healthy" Rating
Rate the healthiness of this meal on a scale of 1 to 10 (10 being exceptionally nutrient-dense and whole-food based). 
* **NutriMind Health Score:** ${healthAssessment.score}/10
* **Why this score?:** ${healthAssessment.explanation}

### 4. Key Properties & Micronutrients
* **Key Vitamins/Minerals:** ${properties.micronutrients.join(", ")}
* **Dietary Attributes:** ${properties.attributes.join(", ")}

### 5. NutriMind Actionable Tip
* ${actionableTip}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(requestedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scorePercentage = Math.min(100, Math.max(0, healthAssessment.score * 10));

  // Determine label tags based on nutrients
  const proteinLabel = nutritionalProfile.protein > 20 ? "High Lean" : "Standard Lean";
  const carbsLabel = nutritionalProfile.carbohydrates > 50 ? "Complex energy" : "Low glycemic";
  const fatsLabel = nutritionalProfile.fats > 15 ? "Healthy lipids" : "Low lipids";
  const fiberLabel = nutritionalProfile.fiber > 8 ? "Excellent fiber" : "Prebiotic fiber";

  return (
    <div id="report-root" className="bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 p-4 sm:p-6 shadow-xl shadow-emerald-900/5 overflow-hidden">
      {/* Header and Tabs */}
      <div className="px-3 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-emerald-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5.5 h-5.5 text-emerald-600" />
            Report Dashboard
          </h2>
          <p className="text-xs text-emerald-700/80 font-mono mt-0.5">ESTIMATED ANALYSIS BY NUTRIMIND ENGINE</p>
        </div>

        <div className="flex bg-emerald-100/60 p-1 rounded-xl self-start sm:self-auto border border-emerald-200/40">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-emerald-800 hover:text-emerald-900"
            }`}
          >
            Bento Dashboard
          </button>
          <button
            id="tab-markdown"
            onClick={() => setActiveTab("markdown")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "markdown"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-emerald-800 hover:text-emerald-900"
            }`}
          >
            Requested Markdown
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "dashboard" ? (
          <motion.div
            key="dashboard-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
          >
            {/* Bento Block 1: Image Analysis Area (col-span-5, row-span-6 equivalent) */}
            <div className="col-span-12 md:col-span-5 md:row-span-6 bg-white rounded-3xl overflow-hidden shadow-sm border border-emerald-100 relative min-h-[380px] flex flex-col justify-between">
              <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                {imageUrl ? (
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-100/80 via-teal-50 to-emerald-50 flex flex-col items-center justify-center p-8 text-center">
                    <Apple className="w-16 h-16 text-emerald-600/30 mb-2 animate-bounce" />
                    <p className="text-xs text-emerald-800/50 font-mono">No photo provided</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent" />
              </div>

              {/* Top watermark badge */}
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-emerald-100/50 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <Hash className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-mono">Identified Meal</span>
              </div>

              <div className="relative z-10 p-6 mt-auto text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-1">Estimated Bowl</p>
                <h3 className="text-2xl font-bold tracking-tight text-white leading-tight">
                  {foodIdentification.dishName}
                </h3>
                <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1.5 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                  Portion Size: {foodIdentification.portionSize}
                </p>
              </div>
            </div>

            {/* Bento Block 2: Health Score (col-span-3, row-span-2) */}
            <div className="col-span-12 md:col-span-3 md:row-span-2 bg-emerald-900 rounded-3xl p-6 flex flex-col justify-center items-center text-white relative overflow-hidden shadow-md">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-800/40 rounded-full blur-xl pointer-events-none"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-2">NutriMind Score</span>
              <div className="text-6xl font-black tracking-tight mb-2 flex items-baseline">
                {healthAssessment.score}
                <span className="text-sm font-normal text-emerald-300">/10</span>
              </div>
              
              <div className="h-1.5 w-full bg-emerald-950 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-1000" 
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-emerald-100/90 text-center leading-normal italic mt-1 line-clamp-3">
                "{healthAssessment.explanation}"
              </p>
            </div>

            {/* Bento Block 3: Actionable Tip (col-span-4, row-span-2) */}
            <div className="col-span-12 md:col-span-4 md:row-span-2 bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100/50">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-bold text-stone-800 uppercase tracking-tight text-xs">Actionable Tip</span>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed flex-grow">
                {actionableTip}
              </p>
              <div className="text-[9px] text-emerald-700 font-mono tracking-wider mt-3 uppercase">
                ⚡ Pro-active Optimization
              </div>
            </div>

            {/* Bento Block 4: Macronutrients Grid (col-span-7, row-span-3) */}
            <div className="col-span-12 md:col-span-7 md:row-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-stone-800 tracking-tight uppercase flex items-center gap-2">
                  <Flame className="w-4.5 h-4.5 text-emerald-600" />
                  Nutritional Profile
                </h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/80 text-xs px-3 py-1 rounded-full font-bold">
                  {nutritionalProfile.calories} kcal
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col items-center justify-center text-center">
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-1">Protein</span>
                  <span className="text-2xl font-black text-emerald-600">{nutritionalProfile.protein}g</span>
                  <span className="text-[10px] text-stone-400 mt-1 font-mono">{proteinLabel}</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col items-center justify-center text-center">
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-1">Carbs</span>
                  <span className="text-2xl font-black text-blue-600">{nutritionalProfile.carbohydrates}g</span>
                  <span className="text-[10px] text-stone-400 mt-1 font-mono">{carbsLabel}</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col items-center justify-center text-center">
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-1">Fats</span>
                  <span className="text-2xl font-black text-amber-600">{nutritionalProfile.fats}g</span>
                  <span className="text-[10px] text-stone-400 mt-1 font-mono">{fatsLabel}</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col items-center justify-center text-center">
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mb-1">Fiber</span>
                  <span className="text-2xl font-black text-purple-600">{nutritionalProfile.fiber}g</span>
                  <span className="text-[10px] text-stone-400 mt-1 font-mono">{fiberLabel}</span>
                </div>
              </div>
            </div>

            {/* Bento Block 5: Key Attributes (col-span-4, row-span-1) */}
            <div className="col-span-12 md:col-span-4 md:row-span-1 bg-white rounded-[2rem] p-5 border border-emerald-100 shadow-sm flex flex-col justify-center gap-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Key Attributes</span>
              <div className="flex flex-wrap gap-1.5">
                {properties.attributes.map((attr, idx) => (
                  <span 
                    key={idx} 
                    className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-1 rounded"
                  >
                    {attr}
                  </span>
                ))}
                {properties.attributes.length === 0 && (
                  <span className="text-[10px] text-stone-400 italic">No attributes defined</span>
                )}
              </div>
            </div>

            {/* Bento Block 6: Key Vitamins & Minerals (col-span-4, row-span-1) */}
            <div className="col-span-12 md:col-span-4 md:row-span-1 bg-white rounded-[2rem] p-5 border border-emerald-100 shadow-sm flex flex-col justify-center gap-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Vitamins & Minerals</span>
              <div className="flex flex-wrap gap-1.5">
                {properties.micronutrients.map((micro, idx) => (
                  <span 
                    key={idx} 
                    className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase px-2 py-1 rounded"
                  >
                    {micro}
                  </span>
                ))}
                {properties.micronutrients.length === 0 && (
                  <span className="text-[10px] text-stone-400 italic">No minerals specified</span>
                )}
              </div>
            </div>

            {/* Bento Block 7: Summary Note (col-span-3, row-span-1) */}
            <div className="col-span-12 md:col-span-4 md:row-span-1 bg-white/50 backdrop-blur-md rounded-3xl p-5 border border-dashed border-emerald-200 flex items-center shadow-xs">
              <p className="text-[11px] text-stone-600 leading-normal italic">
                {properties.micronutrients[0] || "This meal"} provides exceptional holistic nourishment, supporting your metabolic wellbeing throughout the day.
              </p>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="markdown-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-emerald-800 font-medium">
                This report is formatted in the exact structured markdown requested.
              </p>
              <button
                id="btn-copy-markdown"
                onClick={copyToClipboard}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl text-xs px-4 py-2 flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-emerald-950/10 active:scale-98"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied Report!" : "Copy Report"}
              </button>
            </div>

            <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 font-mono text-xs overflow-x-auto leading-relaxed border border-stone-800 shadow-inner max-h-[500px]">
              <pre className="whitespace-pre-wrap">{requestedMarkdown}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


# NutriMind AI

NutriMind AI is an advanced, empathetic, and highly accurate nutritional analysis application. By analyzing an uploaded image of food, it provides a detailed breakdown of its properties, nutritional profile, a holistic health assessment, and positive actionable advice in a gorgeous, modern, responsive **Bento Grid** dashboard interface.

---

## 🌟 Key Features

1. **AI Food Identification & Portion Estimation**
   - Seamlessly detects individual food items and whole dishes.
   - Delivers accurate portion estimates (e.g., in grams, cups, or servings).

2. **Durable Macronutrient & Energy Profiling**
   - Calculates estimated Calories (kcal), Protein (g), Carbohydrates (g), Fats (g), and Dietary Fiber (g).
   - Dynamically flags dietary features (e.g. *High Lean* protein, *Complex* carbohydrates, *Prebiotic* fiber).

3. **Bento Grid Dashboard**
   - An eye-pleasing, state-of-the-art visual presentation highlighting nutritional facts, macronutrient balances, key vitamins, and attributes in modern card partitions.

4. **NutriMind Health Score**
   - Ranks the overall nutritional health density of your dish on a scale of 1 to 10 with clear, clinically conscious reasoning.

5. **Key Properties & Micronutrients**
   - Identifies highlight vitamins, minerals, and dietary attributes (e.g., *Low Glycemic*, *Whole-food*, *High Iron*).

6. **Actionable Wellness Tips**
   - Generates positive, encouraging, and clinical tips to instantly optimize the meal's nutrient uptake.

7. **Dual Upload Workflow**
   - Supports Drag-and-Drop file uploads, direct filesystem browsing, and integrated device **Live Camera Capture** for instant photo analysis.

8. **One-Click Presets & Session History**
   - Features pre-loaded classic healthy dish shortcuts for rapid testing.
   - Locally persists analyzed meal history for seamless meal-logging tracking.

---

## 🚀 Tech Stack & Architecture

- **Frontend:** React 18+, TypeScript, Tailwind CSS, Motion (Framer Motion)
- **Backend:** Node.js, Express (Express 4)
- **AI Core:** `@google/genai` TypeScript SDK leveraging `gemini-3.1-flash-lite` with automatic fallback to `gemini-3.6-flash` and `gemini-3.8-flash` for high-throughput, sub-2s visual and nutritional assessments.
- **Styling Theme:** Warm, nature-inspired **Emerald Bento Grid** palette with clean typography (Outfit display headlines paired with Inter body text and JetBrains Mono code tags).

---

## 🛠️ Step-by-Step Local Setup Sequence

Follow these steps in sequence to get NutriMind AI running locally on your computer:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended) and npm.

### 2. Clone and Prepare the Repository
```bash
# Clone the repository
git clone <your-repository-url>
cd <repository-folder>

# Install the dependencies
npm install
```

### 3. Configure Environment Variables
Create a file named `.env` in the root of the project (you can copy the format from `.env.example`):
```env
# Required for Gemini AI API calls
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"

# Optional App hosting URL
APP_URL="http://localhost:3000"
```

### 4. Run the Development Server
Run the full-stack development environment where both the React Vite frontend and Express server execute in tandem:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application!

### 5. Create a Production Build
Compile the application to highly optimized client bundles and a bundled backend server script:
```bash
# Build the React static client and Express backend
npm run build

# Start the compiled production applet
npm run start
```

---

## 🔌 API Endpoints

### `POST /api/analyze`
Submits a food image to the NutriMind AI engine for structured evaluation.

**Request Body:**
```json
{
  "image": "iVBORw0KGgoAAAANS...", // Base64 encoded image string (optional if sampleUrl is provided)
  "mimeType": "image/jpeg",         // MIME type of the uploaded image
  "sampleUrl": "https://..."        // Optional: Remote URL of a preset meal image to fetch and analyze
}
```

**Response JSON Structure:**
```json
{
  "foodIdentification": {
    "dishName": "Avocado Toast with Egg",
    "portionSize": "1 slice, 150g"
  },
  "nutritionalProfile": {
    "calories": 280,
    "protein": 11,
    "carbohydrates": 24,
    "fats": 16,
    "fiber": 6
  },
  "healthAssessment": {
    "score": 8,
    "explanation": "This meal is exceptional in dietary fiber and healthy monounsaturated fats from avocado, backed by a clean protein source from the egg. Highly whole-food based with low processing."
  },
  "properties": {
    "micronutrients": ["Vitamin E", "Potassium", "Folate"],
    "attributes": ["Whole-food", "High-Fiber", "Healthy Fats"]
  },
  "actionableTip": "Consider sprinkling a tablespoon of flaxseed or chia seeds on top to increase Omega-3 fatty acids without spiking carbs."
}
```

---

## 🔒 Security & Privacy

NutriMind AI handles all image analyses and API communication on the server-side. **Your `GEMINI_API_KEY` is never exposed to the web browser client**, protecting it from unauthorized access and keeping your credentials fully secure.

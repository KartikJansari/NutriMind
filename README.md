# 🥗 NutriMind — AI Nutritional Intelligence & Food Analysis

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

**NutriMind** is an advanced, empathetic, and highly accurate nutritional analysis web application. By analyzing an uploaded food photo or live camera snapshot, it delivers real-time breakdown of ingredients, calorie and macronutrient distributions, health density scores, and actionable clinical advice in a modern **Bento Grid** dashboard interface.

---

## 🌟 Key Features

1. **AI Food Identification & Portion Estimation**
   - Automatically detects dishes, ingredients, and portion weights (grams, cups, servings).
   - Accurately identifies complex multi-ingredient dishes.

2. **Durable Macronutrient & Calorie Profiling**
   - Calculates estimated Calories (kcal), Protein (g), Carbohydrates (g), Fats (g), and Dietary Fiber (g).
   - Dynamically highlights key dietary traits (*High Lean Protein*, *Complex Carbohydrates*, *Prebiotic Fiber*).

3. **Bento Grid Dashboard**
   - Modern, aesthetic visual layout presenting calorie gauges, macro distributions, micro-nutrient tags, and health recommendations in cohesive card modules.

4. **NutriMind Health Score**
   - Rates meal quality on a clinical 1–10 scale based on whole-food density, balance, and processing level with clear explanations.

5. **Actionable Wellness Tips**
   - Provides encouraging, dietitian-grade suggestions to optimize nutrient absorption and glycemic response.

6. **Flexible Image Input**
   - Drag-and-drop file upload, device filesystem browsing, and integrated device **Live Camera Capture**.
   - Built-in preset dishes for quick testing.

7. **Local Meal History**
   - Automatically records recent analyses in your browser storage for session review.

---

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion (Framer Motion), Recharts, Lucide Icons
- **Backend:** Node.js, Express, tsx
- **Build Tool:** Vite 6 with development middleware
- **AI Engine:** Google Gemini Generative AI SDK (`@google/genai`)

---

## 🛠️ Quick Start & Local Setup

Follow these steps to run NutriMind locally:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A **Gemini API Key** (Get one free at [Google AI Studio](https://aistudio.google.com/apikey))

### 2. Clone the Repository
```bash
git clone https://github.com/KartikJansari/NutriMind.git
cd NutriMind
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
# On Windows (PowerShell):
Copy-Item .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Open `.env` and set your API key:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
APP_URL="http://localhost:3000"
```

### 5. Run the Application
Start the development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📦 Production Build

To compile and launch the production application:

```bash
# Build the client bundle and bundle the server
npm run build

# Start the production server
npm start
```

---

## 🔌 API Reference

### `POST /api/analyze`
Analyzes a food image and returns nutritional assessment JSON.

**Request Payload:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "mimeType": "image/jpeg",
  "sampleUrl": "https://..."
}
```

**Response Example:**
```json
{
  "foodIdentification": {
    "dishName": "Avocado Toast with Poached Egg",
    "portionSize": "1 slice whole-grain bread, 1/2 avocado, 1 egg"
  },
  "nutritionalProfile": {
    "calories": 280,
    "protein": 12,
    "carbohydrates": 22,
    "fats": 16,
    "fiber": 6
  },
  "healthAssessment": {
    "score": 8.5,
    "explanation": "High in healthy monounsaturated fatty acids and dietary fiber with high-bioavailability egg protein."
  },
  "properties": {
    "micronutrients": ["Vitamin E", "Potassium", "Folate", "Choline"],
    "attributes": ["Whole-Food", "High-Fiber", "Heart-Healthy"]
  },
  "actionableTip": "Add a sprinkle of hemp seeds or crushed red pepper for extra anti-inflammatory micronutrients."
}
```

---

## 🔒 Security & Privacy

- All AI requests and API keys are strictly handled **server-side**.
- The `GEMINI_API_KEY` is kept in `.env` and is **never** sent to the client browser or committed to GitHub (prevented via `.gitignore`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use, modify, and distribute.

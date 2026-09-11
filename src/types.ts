export interface FoodIdentification {
  dishName: string;
  portionSize: string;
}

export interface NutritionalProfile {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
}

export interface HealthAssessment {
  score: number; // out of 10
  explanation: string;
}

export interface MealProperties {
  micronutrients: string[];
  attributes: string[];
}

export interface AnalysisResult {
  foodIdentification: FoodIdentification;
  nutritionalProfile: NutritionalProfile;
  healthAssessment: HealthAssessment;
  properties: MealProperties;
  actionableTip: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  image: string; // base64 representation for preview persistence
  mimeType: string;
  result: AnalysisResult;
}

export interface Character {
  id: string;
  name: string;
  physical: string;
  clothing?: string;
  style?: string;
  expression?: string;
  action?: string;
  interaction?: string;
  interactionTarget?: string;
  interactionWith?: string;
  isBackground: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterScene {
  characterId: string;
  expression?: string;
  action?: string;
  interaction?: string;
  interactionTarget?: string;
  interactionWith?: string;
  pose?: string;
  cameraAngle?: string;
  lighting?: string;
}

export interface CharacterDialog {
  characterId: string;
  dialog: string;
  expression?: string;
}

// Opsi untuk adegan
export const expressionOptions = [
  { value: "senang", label: "Senang" },
  { value: "sedih", label: "Sedih" },
  { value: "marah", label: "Marah" },
  { value: "terkejut", label: "Terkejut" },
  { value: "takut", label: "Takut" },
  { value: "bingung", label: "Bingung" },
  { value: "malu", label: "Malu" },
  { value: "netral", label: "Netral" },
];

export const actionOptions = [
  { value: "berlari", label: "Berlari" },
  { value: "berjalan", label: "Berjalan" },
  { value: "melompat", label: "Melompat" },
  { value: "meninju", label: "Meninju" },
  { value: "duduk", label: "Duduk" },
  { value: "berbaring", label: "Berbaring" },
  { value: "menyelinap", label: "Menyelinap" },
  { value: "bertarung", label: "Bertarung" },
  { value: "berbicara", label: "Berbicara" },
  { value: "berteriak", label: "Berteriak" },
];

export const poseOptions = [
  { value: "berdiri", label: "Berdiri" },
  { value: "duduk", label: "Duduk" },
  { value: "berbaring", label: "Berbaring" },
  { value: "berlutut", label: "Berlutut" },
  { value: "menunduk", label: "Menunduk" },
  { value: "mengangkat-tangan", label: "Mengangkat Tangan" },
  { value: "mengepalkan-tangan", label: "Mengepalkan Tangan" },
  { value: "menyilangkan-tangan", label: "Menyilangkan Tangan" },
  { value: "menopang-dagu", label: "Menopang Dagu" },
  { value: "menggaruk-kepala", label: "Menggaruk Kepala" },
];

export const cameraAngleOptions = [
  { value: "close-up", label: "Close-up" },
  { value: "medium-shot", label: "Medium Shot" },
  { value: "long-shot", label: "Long Shot" },
  { value: "bird-eye", label: "Bird's Eye View" },
  { value: "low-angle", label: "Low Angle" },
  { value: "over-the-shoulder", label: "Over the Shoulder" },
  { value: "dutch-angle", label: "Dutch Angle (Tilted)" },
];

export const lightingOptions = [
  { value: "natural", label: "Natural" },
  { value: "dramatic", label: "Dramatic" },
  { value: "backlight", label: "Backlight" },
  { value: "rim-light", label: "Rim Light" },
  { value: "soft", label: "Soft" },
  { value: "harsh", label: "Harsh" },
  { value: "colored", label: "Colored" },
  { value: "spotlight", label: "Spotlight" },
]; 
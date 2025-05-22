export interface ArtStyle {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  examples: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Background {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  physical?: string;
  clothing?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  year: string;
  specialFeatures: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dialog {
  id: string;
  characterId: string;
  text: string;
  bubbleType: "speech" | "thought" | "whisper" | "shout";
  emotion: string;
  createdAt: string;
  updatedAt: string;
}

export interface Effect {
  id: string;
  name: string;
  description: string;
  type: "sound" | "visual" | "transition";
  createdAt: string;
  updatedAt: string;
}

export interface ComicCharacter {
  id: string;
  name: string;
  physical: string;
  clothing?: string;
  isBackground: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComicScene {
  id: string;
  title: string;
  description: string;
  characters: string[];
  background: string;
  style: string;
  effects: string[];
}

export interface ComicData {
  characters: ComicCharacter[];
  scenes: ComicScene[];
} 
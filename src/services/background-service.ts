import type { Background } from '../types/service';

const STORAGE_KEY = "comic_backgrounds";

export class BackgroundService {
  static async getAllBackgrounds(): Promise<Background[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      throw new Error("Failed to get backgrounds");
    }
  }

  static async saveBackground(background: Omit<Background, "id" | "createdAt" | "updatedAt">): Promise<Background> {
    try {
      const backgrounds = await this.getAllBackgrounds();
      const newBackground: Background = {
        ...background,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      backgrounds.push(newBackground);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backgrounds));
      return newBackground;
    } catch {
      throw new Error("Failed to save background");
    }
  }

  static async updateBackground(id: string, background: Partial<Omit<Background, "id" | "createdAt" | "updatedAt">>): Promise<Background> {
    try {
      const backgrounds = await this.getAllBackgrounds();
      const index = backgrounds.findIndex(bg => bg.id === id);
      if (index === -1) {
        throw new Error("Background not found");
      }
      const updatedBackground: Background = {
        ...backgrounds[index],
        ...background,
        updatedAt: new Date().toISOString()
      };
      backgrounds[index] = updatedBackground;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backgrounds));
      return updatedBackground;
    } catch {
      throw new Error("Failed to update background");
    }
  }

  static async deleteBackground(id: string): Promise<void> {
    try {
      const backgrounds = await this.getAllBackgrounds();
      const filteredBackgrounds = backgrounds.filter(background => background.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBackgrounds));
    } catch {
      throw new Error("Failed to delete background");
    }
  }

  static async getBackgroundById(id: string): Promise<Background | null> {
    try {
      const backgrounds = await this.getAllBackgrounds();
      return backgrounds.find(background => background.id === id) || null;
    } catch {
      throw new Error("Failed to get background");
    }
  }
} 
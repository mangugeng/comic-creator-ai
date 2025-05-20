import { z } from "zod";

const backgroundSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

type Background = z.infer<typeof backgroundSchema>;

export class BackgroundService {
  private static STORAGE_KEY = "comic_backgrounds";

  static async getAllBackgrounds(): Promise<Background[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting backgrounds:", error);
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
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backgrounds));
      return newBackground;
    } catch (error) {
      console.error("Error saving background:", error);
      throw new Error("Failed to save background");
    }
  }

  static async updateBackground(id: string, background: Partial<Background>): Promise<Background> {
    try {
      const backgrounds = await this.getAllBackgrounds();
      const index = backgrounds.findIndex(bg => bg.id === id);
      
      if (index === -1) {
        throw new Error("Background not found");
      }

      const updatedBackground = {
        ...backgrounds[index],
        ...background,
        updatedAt: new Date().toISOString()
      };

      backgrounds[index] = updatedBackground;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backgrounds));
      return updatedBackground;
    } catch (error) {
      console.error("Error updating background:", error);
      throw error;
    }
  }

  static async deleteBackground(id: string): Promise<void> {
    try {
      const backgrounds = await this.getAllBackgrounds();
      const filteredBackgrounds = backgrounds.filter(background => background.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBackgrounds));
    } catch (error) {
      console.error("Error deleting background:", error);
      throw new Error("Failed to delete background");
    }
  }

  static async getBackgroundById(id: string): Promise<Background | null> {
    try {
      const backgrounds = await this.getAllBackgrounds();
      return backgrounds.find(background => background.id === id) || null;
    } catch (error) {
      console.error("Error getting background:", error);
      throw new Error("Failed to get background");
    }
  }
} 
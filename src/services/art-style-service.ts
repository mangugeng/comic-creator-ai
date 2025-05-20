import { z } from "zod";

const artStyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  characteristics: z.array(z.string()),
  examples: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string()
});

type ArtStyle = z.infer<typeof artStyleSchema>;

const STORAGE_KEY = "comic_art_styles";

export class ArtStyleService {
  static async getAllArtStyles(): Promise<ArtStyle[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting art styles:", error);
      return [];
    }
  }

  static async saveArtStyle(artStyle: Omit<ArtStyle, "id" | "createdAt" | "updatedAt">): Promise<ArtStyle> {
    try {
      const artStyles = await this.getAllArtStyles();
      const newArtStyle: ArtStyle = {
        ...artStyle,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      artStyles.push(newArtStyle);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(artStyles));
      return newArtStyle;
    } catch (error) {
      console.error("Error saving art style:", error);
      throw error;
    }
  }

  static async deleteArtStyle(id: string): Promise<void> {
    try {
      const artStyles = await this.getAllArtStyles();
      const filteredArtStyles = artStyles.filter(style => style.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredArtStyles));
    } catch (error) {
      console.error("Error deleting art style:", error);
      throw error;
    }
  }

  static async updateArtStyle(id: string, data: Omit<ArtStyle, "id" | "createdAt" | "updatedAt">): Promise<ArtStyle | null> {
    try {
      const artStyles = await this.getAllArtStyles();
      const idx = artStyles.findIndex(style => style.id === id);
      if (idx === -1) return null;
      const updated: ArtStyle = {
        ...artStyles[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      artStyles[idx] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(artStyles));
      return updated;
    } catch (error) {
      console.error("Error updating art style:", error);
      throw error;
    }
  }
} 
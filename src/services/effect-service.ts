import { z } from "zod";

const effectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["visual", "sound"]),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

type Effect = z.infer<typeof effectSchema>;

export class EffectService {
  private static STORAGE_KEY = "comic_effects";

  static async getAllEffects(): Promise<Effect[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting effects:", error);
      throw new Error("Failed to get effects");
    }
  }

  static async saveEffect(effect: Omit<Effect, "id" | "createdAt" | "updatedAt">): Promise<Effect> {
    try {
      const effects = await this.getAllEffects();
      const newEffect: Effect = {
        ...effect,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      effects.push(newEffect);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(effects));
      return newEffect;
    } catch (error) {
      console.error("Error saving effect:", error);
      throw new Error("Failed to save effect");
    }
  }

  static async deleteEffect(id: string): Promise<void> {
    try {
      const effects = await this.getAllEffects();
      const filteredEffects = effects.filter(effect => effect.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredEffects));
    } catch (error) {
      console.error("Error deleting effect:", error);
      throw new Error("Failed to delete effect");
    }
  }

  static async getEffectById(id: string): Promise<Effect | null> {
    try {
      const effects = await this.getAllEffects();
      return effects.find(effect => effect.id === id) || null;
    } catch (error) {
      console.error("Error getting effect:", error);
      throw new Error("Failed to get effect");
    }
  }
} 
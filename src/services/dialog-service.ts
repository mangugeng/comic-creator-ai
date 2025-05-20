import { z } from "zod";

const dialogSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  text: z.string(),
  bubbleType: z.enum(["speech", "thought", "whisper", "shout"]),
  emotion: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

type Dialog = z.infer<typeof dialogSchema>;

const STORAGE_KEY = "comic_dialogs";

export class DialogService {
  static async getAllDialogs(): Promise<Dialog[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting dialogs:", error);
      return [];
    }
  }

  static async getDialogsByCharacter(characterId: string): Promise<Dialog[]> {
    try {
      const dialogs = await this.getAllDialogs();
      return dialogs.filter(dialog => dialog.characterId === characterId);
    } catch (error) {
      console.error("Error getting character dialogs:", error);
      return [];
    }
  }

  static async saveDialog(dialog: Omit<Dialog, "id" | "createdAt" | "updatedAt">): Promise<Dialog> {
    try {
      const dialogs = await this.getAllDialogs();
      const newDialog: Dialog = {
        ...dialog,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      dialogs.push(newDialog);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dialogs));
      return newDialog;
    } catch (error) {
      console.error("Error saving dialog:", error);
      throw error;
    }
  }

  static async deleteDialog(id: string): Promise<void> {
    try {
      const dialogs = await this.getAllDialogs();
      const filteredDialogs = dialogs.filter(dialog => dialog.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDialogs));
    } catch (error) {
      console.error("Error deleting dialog:", error);
      throw error;
    }
  }
} 
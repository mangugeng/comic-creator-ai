import type { Dialog } from '../types/service';

const STORAGE_KEY = "comic_dialogs";

export class DialogService {
  static async getAllDialogs(): Promise<Dialog[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      throw new Error("Failed to get dialogs from storage");
    }
  }

  static async getDialogsByCharacter(characterId: string): Promise<Dialog[]> {
    try {
      const dialogs = await this.getAllDialogs();
      return dialogs.filter(dialog => dialog.characterId === characterId);
    } catch {
      throw new Error("Failed to get dialogs by character");
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
    } catch {
      throw new Error("Failed to save dialog");
    }
  }

  static async deleteDialog(id: string): Promise<void> {
    try {
      const dialogs = await this.getAllDialogs();
      const filteredDialogs = dialogs.filter(dialog => dialog.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDialogs));
    } catch {
      throw new Error("Failed to delete dialog");
    }
  }
} 
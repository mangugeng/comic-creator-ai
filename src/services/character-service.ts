import type { Character } from "../types/service";

const STORAGE_KEY = "comic_characters";

export class CharacterService {
  static async getAllCharacters(): Promise<Character[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting characters:", error);
      return [];
    }
  }

  static async saveCharacter(character: Character): Promise<void> {
    try {
      const characters = await this.getAllCharacters();
      const existingIndex = characters.findIndex(c => c.id === character.id);
      
      if (existingIndex >= 0) {
        characters[existingIndex] = {
          ...character,
          updatedAt: new Date().toISOString()
        };
      } else {
        characters.push({
          ...character,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch (error) {
      console.error("Error saving character:", error);
      throw error;
    }
  }

  static async deleteCharacter(id: string): Promise<void> {
    try {
      const characters = await this.getAllCharacters();
      const filtered = characters.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting character:", error);
      throw error;
    }
  }

  static async updateCharacter(id: string, data: Partial<Character>): Promise<void> {
    try {
      const characters = await this.getAllCharacters();
      const index = characters.findIndex(c => c.id === id);
      
      if (index >= 0) {
        characters[index] = {
          ...characters[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
      }
    } catch (error) {
      console.error("Error updating character:", error);
      throw error;
    }
  }

  // Get a character by ID
  static async getCharacterById(id: string): Promise<Character | null> {
    const characters = await this.getAllCharacters();
    return characters.find(char => char.id === id) || null;
  }
} 
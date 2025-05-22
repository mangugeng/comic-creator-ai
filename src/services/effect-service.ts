import type { Effect } from '../types/service';

const STORAGE_KEY = 'effects';

export class EffectService {
  static getEffects(): Effect[] {
    if (typeof window === 'undefined') return [];
    const effects = localStorage.getItem(STORAGE_KEY);
    return effects ? JSON.parse(effects) : [];
  }

  static addEffect(effect: Omit<Effect, 'id' | 'createdAt' | 'updatedAt'>): Effect {
    const effects = this.getEffects();
    const newEffect: Effect = {
      ...effect,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    effects.push(newEffect);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(effects));
    return newEffect;
  }

  static updateEffect(id: string, effect: Partial<Effect>): Effect | null {
    const effects = this.getEffects();
    const index = effects.findIndex(e => e.id === id);
    if (index === -1) return null;

    const updatedEffect: Effect = {
      ...effects[index],
      ...effect,
      updatedAt: new Date().toISOString()
    };
    effects[index] = updatedEffect;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(effects));
    return updatedEffect;
  }

  static deleteEffect(id: string): boolean {
    const effects = this.getEffects();
    const filteredEffects = effects.filter(e => e.id !== id);
    if (filteredEffects.length === effects.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEffects));
    return true;
  }
} 
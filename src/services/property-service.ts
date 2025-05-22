import type { Property } from '../types/service';

const STORAGE_KEY = 'properties';

export class PropertyService {
  static getProperties(): Property[] {
    if (typeof window === 'undefined') return [];
    const properties = localStorage.getItem(STORAGE_KEY);
    return properties ? JSON.parse(properties) : [];
  }

  static addProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
    const properties = this.getProperties();
    const newProperty: Property = {
      ...property,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    properties.push(newProperty);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    return newProperty;
  }

  static updateProperty(id: string, property: Partial<Property>): Property | null {
    const properties = this.getProperties();
    const index = properties.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProperty: Property = {
      ...properties[index],
      ...property,
      updatedAt: new Date().toISOString()
    };
    properties[index] = updatedProperty;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    return updatedProperty;
  }

  static deleteProperty(id: string): boolean {
    const properties = this.getProperties();
    const filteredProperties = properties.filter(p => p.id !== id);
    if (filteredProperties.length === properties.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProperties));
    return true;
  }
} 
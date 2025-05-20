"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit2, Trash2, Save, X } from "lucide-react";
import { Character } from "@/types/character";
import { CharacterService } from "@/services/character-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CharacterLibrary() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Character>>({
    name: "",
    physical: "",
    clothing: "",
    expression: "",
    action: "",
    style: "",
    isBackground: false,
  });

  // Load characters on mount
  useEffect(() => {
    setCharacters(CharacterService.getAllCharacters());
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Save character
  const handleSave = () => {
    if (isEditing) {
      const updated = CharacterService.updateCharacter(isEditing, formData);
      if (updated) {
        setCharacters(prev => prev.map(char => char.id === isEditing ? updated : char));
      }
    } else {
      const newChar = CharacterService.saveCharacter(formData as Omit<Character, "id" | "createdAt" | "updatedAt">);
      setCharacters(prev => [...prev, newChar]);
    }
    handleClose();
  };

  // Edit character
  const handleEdit = (character: Character) => {
    setIsEditing(character.id);
    setFormData(character);
  };

  // Delete character
  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus karakter ini?")) {
      if (CharacterService.deleteCharacter(id)) {
        setCharacters(prev => prev.filter(char => char.id !== id));
      }
    }
  };

  // Close form
  const handleClose = () => {
    setIsEditing(null);
    setIsAdding(false);
    setFormData({
      name: "",
      physical: "",
      clothing: "",
      expression: "",
      action: "",
      style: "",
      isBackground: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Library Karakter</h2>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Karakter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Karakter" : "Tambah Karakter Baru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                name="name"
                placeholder="Nama Karakter"
                value={formData.name}
                onChange={handleInputChange}
              />
              <Textarea
                name="physical"
                placeholder="Deskripsi Fisik"
                value={formData.physical}
                onChange={handleInputChange}
              />
              <Input
                name="clothing"
                placeholder="Pakaian"
                value={formData.clothing}
                onChange={handleInputChange}
              />
              <Input
                name="expression"
                placeholder="Ekspresi"
                value={formData.expression}
                onChange={handleInputChange}
              />
              <Input
                name="action"
                placeholder="Aksi"
                value={formData.action}
                onChange={handleInputChange}
              />
              <Input
                name="style"
                placeholder="Gaya"
                value={formData.style}
                onChange={handleInputChange}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isBackground"
                  checked={formData.isBackground}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4"
                />
                <label>Karakter Latar</label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map(character => (
          <Card key={character.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{character.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(character)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(character.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Fisik:</strong> {character.physical}</p>
                {character.clothing && <p><strong>Pakaian:</strong> {character.clothing}</p>}
                {character.expression && <p><strong>Ekspresi:</strong> {character.expression}</p>}
                {character.action && <p><strong>Aksi:</strong> {character.action}</p>}
                {character.style && <p><strong>Gaya:</strong> {character.style}</p>}
                {character.isBackground && <p className="text-blue-500">Karakter Latar</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
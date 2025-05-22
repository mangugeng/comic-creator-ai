"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import type { Character } from "@/types/service";
import { CharacterService } from "@/services/character-service";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  physical: z.string().min(1, "Deskripsi fisik harus diisi"),
  clothing: z.string().optional(),
  isBackground: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CharacterSelectorProps {
  onSelect: (character: Character, isSelected: boolean) => void;
}

export function CharacterSelector({ onSelect }: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      physical: "",
      clothing: "",
      isBackground: false,
    },
  });

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const loadedCharacters = await CharacterService.getAllCharacters();
      setCharacters(loadedCharacters);
    } catch (error) {
      console.error("Error loading characters:", error);
      toast.error("Gagal memuat karakter");
    }
  };

  const handleSelect = (character: Character) => {
    const newSelected = new Set(selectedCharacters);
    if (newSelected.has(character.id)) {
      newSelected.delete(character.id);
      onSelect(character, false);
    } else {
      newSelected.add(character.id);
      onSelect(character, true);
    }
    setSelectedCharacters(newSelected);
  };

  const handleDelete = async (character: Character) => {
    try {
      await CharacterService.deleteCharacter(character.id);
      setCharacters(characters.filter(c => c.id !== character.id));
      toast.success("Karakter berhasil dihapus");
    } catch (error) {
      console.error("Error deleting character:", error);
      toast.error("Gagal menghapus karakter");
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    form.reset({
      name: character.name,
      physical: character.physical,
      clothing: character.clothing || "",
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    if (!editingCharacter) return;

    try {
      await CharacterService.updateCharacter(editingCharacter.id, {
        ...values,
        id: editingCharacter.id,
      });
      
      setCharacters(characters.map(c => 
        c.id === editingCharacter.id 
          ? { ...c, ...values }
          : c
      ));
      
      toast.success("Karakter berhasil diperbarui");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating character:", error);
      toast.error("Gagal memperbarui karakter");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <Card
            key={character.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedCharacters.has(character.id)
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => handleSelect(character)}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{character.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(character);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(character);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{character.physical}</p>
              {character.clothing && (
                <p className="text-sm text-muted-foreground">{character.clothing}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Karakter</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama / Identitas</FormLabel>
                    <FormControl>
                      <Input placeholder="Hiro, detektif muda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="physical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Fisik</FormLabel>
                    <FormControl>
                      <Input placeholder="Rambut hitam pendek, mata tajam, tinggi 170cm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clothing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pakaian</FormLabel>
                    <FormControl>
                      <Input placeholder="Jas panjang hitam, dasi merah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
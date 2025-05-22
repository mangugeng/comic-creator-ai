"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { CharacterService } from "@/services/character-service";
import type { Character } from "@/types/service";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  physical: z.string().min(1, "Deskripsi fisik harus diisi"),
  clothing: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CharacterLibrary() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      physical: "",
      clothing: "",
    }
  });

  // Load characters on mount
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const chars = await CharacterService.getAllCharacters();
        setCharacters(chars);
      } catch {
        showToast({
          title: "Error",
          description: "Gagal memuat daftar karakter",
          variant: "destructive"
        });
      }
    };
    loadCharacters();
  }, [showToast]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);
      if (editId) {
        await CharacterService.updateCharacter(editId, {
          ...data,
          id: editId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await CharacterService.saveCharacter({
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      showToast({
        title: "Sukses",
        description: editId ? "Karakter berhasil diupdate!" : "Karakter berhasil disimpan!",
      });
      form.reset();
      setShowForm(false);
      setEditId(null);
      const chars = await CharacterService.getAllCharacters();
      setCharacters(chars);
    } catch {
      showToast({
        title: "Error",
        description: editId ? "Gagal update karakter" : "Gagal menyimpan karakter",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      await CharacterService.deleteCharacter(id);
      showToast({
        title: "Sukses",
        description: "Karakter berhasil dihapus!",
      });
      const chars = await CharacterService.getAllCharacters();
      setCharacters(chars);
    } catch {
      showToast({
        title: "Error",
        description: "Gagal menghapus karakter",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (character: Character) => {
    form.reset({
      name: character.name,
      description: character.description,
      physical: character.physical || "",
      clothing: character.clothing || "",
    });
    setEditId(character.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => { setShowForm(true); setEditId(null); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Karakter
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Karakter</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama karakter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi karakter"
                      className="min-h-[100px]"
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Masukkan deskripsi fisik karakter"
                      className="min-h-[100px]"
                      {...field}
                    />
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
                  <FormLabel>Pakaian (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi pakaian karakter"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isSaving ? "Menyimpan..." : (editId ? "Simpan Perubahan" : "Simpan Karakter")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {characters.map((character) => (
          <Card key={character.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{character.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(character)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCharacter(character.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
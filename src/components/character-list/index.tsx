"use client";

import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, Info, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { CharacterService } from "@/services/character-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  physical: z.string().min(1, "Deskripsi fisik harus diisi"),
  clothing: z.string().optional(),
  isBackground: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

export function CharacterList() {
  const [storedCharacters, setStoredCharacters] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { showToast } = useToast();
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "characters"
  });

  useEffect(() => {
    loadStoredCharacters();
  }, []);

  const loadStoredCharacters = async () => {
    try {
      const characters = await CharacterService.getAllCharacters();
      setStoredCharacters(characters);
    } catch (error) {
      console.error("Error loading characters:", error);
      showToast({
        title: "Error",
        description: "Gagal memuat karakter",
        variant: "destructive",
      });
    }
  };

  const appendNewCharacter = () => {
    setShowAddForm(true);
    form.reset();
  };

  const saveCharacter = async (data: FormValues) => {
    try {
      setIsSaving(true);
      await CharacterService.saveCharacter({
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showToast({
        title: "Sukses",
        description: "Karakter berhasil disimpan!",
      });
      form.reset();
      setShowAddForm(false);
      loadStoredCharacters();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menyimpan karakter",
        variant: "destructive",
      });
      console.error("Error saving character:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateCharacter = async (id: string, data: FormValues) => {
    try {
      setIsSaving(true);
      await CharacterService.updateCharacter(id, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      showToast({
        title: "Sukses",
        description: "Karakter berhasil diperbarui!",
      });
      setSelectedCharacter(null);
      loadStoredCharacters();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal memperbarui karakter",
        variant: "destructive",
      });
      console.error("Error updating character:", error);
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
      loadStoredCharacters();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menghapus karakter",
        variant: "destructive",
      });
      console.error("Error deleting character:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={appendNewCharacter} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Karakter
        </Button>
      </div>

      {showAddForm && (
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
                  <FormLabel>Pakaian</FormLabel>
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
            <FormField
              control={form.control}
              name="isBackground"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Karakter Background</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  const values = form.getValues();
                  const data = {
                    name: values.name,
                    physical: values.physical,
                    clothing: values.clothing,
                    isBackground: values.isBackground,
                  };
                  await saveCharacter(data);
                }}
              >
                {isSaving ? "Menyimpan..." : "Simpan Karakter"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div className="space-y-4">
          {storedCharacters.map((character) => (
            <Card key={character.id} className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{character.name}</span>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{character.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Deskripsi Fisik</h4>
                          <p className="text-sm text-muted-foreground">{character.physical}</p>
                        </div>
                        {character.clothing && (
                          <div>
                            <h4 className="font-medium mb-2">Pakaian</h4>
                            <p className="text-sm text-muted-foreground">{character.clothing}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium mb-2">Status</h4>
                          <p className="text-sm text-muted-foreground">
                            {character.isBackground ? "Karakter Background" : "Karakter Utama"}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCharacter(character)}
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

      {selectedCharacter && (
        <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Karakter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                defaultValue={selectedCharacter.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Karakter</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="physical"
                defaultValue={selectedCharacter.physical}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Fisik</FormLabel>
                    <FormControl>
                      <Textarea
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
                defaultValue={selectedCharacter.clothing}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pakaian</FormLabel>
                    <FormControl>
                      <Textarea
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
                name="isBackground"
                defaultValue={selectedCharacter.isBackground}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Karakter Background</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedCharacter(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    const values = form.getValues();
                    const data = {
                      name: values.name,
                      physical: values.physical,
                      clothing: values.clothing,
                      isBackground: values.isBackground,
                    };
                    await updateCharacter(selectedCharacter.id, data);
                  }}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 
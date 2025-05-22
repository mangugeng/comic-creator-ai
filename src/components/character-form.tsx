"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Character } from "@/types/service";
import { CharacterSelector } from "@/components/character-selector";

interface CharacterField {
  id: string;
  name: string;
  physical: string;
  clothing?: string;
  isBackground?: boolean;
}

interface FormValues {
  characters: CharacterField[];
}

export function CharacterForm() {
  const form = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray<FormValues>({
    control: form.control,
    name: "characters"
  });

  const handleCharacterSelect = (character: Character, isSelected: boolean) => {
    if (isSelected) {
      // Tambahkan karakter baru
      append({
        id: crypto.randomUUID(),
        name: character.name,
        physical: character.physical || "",
        clothing: character.clothing,
      });
    } else {
      // Hapus karakter yang tidak dipilih
      const index = fields.findIndex(field => field.name === character.name);
      if (index !== -1) {
        remove(index);
      }
    }
  };

  const addCharacter = () => {
    append({
      id: crypto.randomUUID(),
      name: "",
      physical: "",
      clothing: "",
      isBackground: false
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Karakter</h3>
        <div className="space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Pilih dari Library
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Pilih Karakter dari Library</DialogTitle>
              </DialogHeader>
              <CharacterSelector onSelect={handleCharacterSelect} />
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="outline"
            onClick={addCharacter}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Karakter
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium">Karakter {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`characters.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama karakter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`characters.${index}.physical`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Fisik</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan deskripsi fisik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`characters.${index}.clothing`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pakaian</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan deskripsi pakaian" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`characters.${index}.isBackground`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Karakter Latar
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { CharacterService } from "@/services/character-service";
import type { Character } from "@/types/service";

interface SceneCharacter {
  id: string;
  characterId: string;
  expression: string;
  action: string;
  interaction: string;
  interactionTarget: string;
  interactionBodyPart: string;
  dialog: string;
  speechBubbleType: string;
}

interface SceneField {
  id: string;
  characters: SceneCharacter[];
  cameraAngle: string;
  description: string;
}

interface FormValues {
  characters: Character[];
  scenes: SceneField[];
}

const cameraAngles = [
  { value: "close-up", label: "Close Up" },
  { value: "medium-shot", label: "Medium Shot" },
  { value: "long-shot", label: "Long Shot" },
  { value: "bird-eye", label: "Bird's Eye View" },
  { value: "worm-eye", label: "Worm's Eye View" },
  { value: "dutch-angle", label: "Dutch Angle" },
  { value: "over-shoulder", label: "Over the Shoulder" },
  { value: "point-of-view", label: "Point of View" }
];

export function SceneForm() {
  const [storedCharacters, setStoredCharacters] = useState<Character[]>([]);
  const form = useFormContext<FormValues>();
  const { fields } = useFieldArray({
    control: form.control,
    name: "scenes"
  });
  const { showToast } = useToast();

  const loadStoredCharacters = useCallback(async () => {
    try {
      const chars = await CharacterService.getAllCharacters();
      setStoredCharacters(chars);
    } catch {
      showToast({
        title: "Error",
        description: "Gagal memuat daftar karakter",
        variant: "destructive",
      });
    }
  }, [showToast]);

  useEffect(() => {
    loadStoredCharacters();
  }, [loadStoredCharacters]);

  // Memoize character options to prevent unnecessary re-renders
  const characterOptions = storedCharacters.map(character => ({
    value: character.id,
    label: character.name
  }));

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <Card key={field.id} className="p-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`scenes.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Adegan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsikan adegan ini..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`scenes.${index}.cameraAngle`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sudut Kamera</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sudut kamera" />
                      </SelectTrigger>
                      <SelectContent>
                        {cameraAngles.map((angle) => (
                          <SelectItem key={angle.value} value={angle.value}>
                            {angle.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Karakter dalam adegan */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Karakter dalam Adegan</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newCharacter: SceneCharacter = {
                      id: crypto.randomUUID(),
                      characterId: "",
                      expression: "",
                      action: "",
                      interaction: "",
                      interactionTarget: "",
                      interactionBodyPart: "",
                      dialog: "",
                      speechBubbleType: "",
                    };
                    const currentCharacters = form.getValues(`scenes.${index}.characters`) || [];
                    form.setValue(`scenes.${index}.characters`, [...currentCharacters, newCharacter]);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Karakter
                </Button>
              </div>

              {form.watch(`scenes.${index}.characters`)?.map((character, charIndex) => (
                <Card key={character.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Karakter {charIndex + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentCharacters = form.getValues(`scenes.${index}.characters`);
                        form.setValue(
                          `scenes.${index}.characters`,
                          currentCharacters.filter((_, i) => i !== charIndex)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`scenes.${index}.characters.${charIndex}.characterId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Karakter</FormLabel>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih karakter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {characterOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`scenes.${index}.characters.${charIndex}.dialog`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dialog</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan dialog..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 
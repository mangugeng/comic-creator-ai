"use client";

import { useState, useEffect } from "react";
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
  const [storedCharacters, setStoredCharacters] = useState<any[]>([]);
  const { showToast } = useToast();
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "scenes"
  });
  const sceneCharacterArrays = fields.map((field, index) =>
    useFieldArray({
      control: form.control,
      name: `scenes.${index}.characters`
    })
  );

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

  const appendNewScene = () => {
    append({
      id: crypto.randomUUID(),
      title: "",
      description: "",
      characters: [],
      cameraAngle: ""
    });
  };

  const appendCharacterToScene = (sceneIndex: number) => {
    sceneCharacterArrays[sceneIndex].append({
      id: crypto.randomUUID(),
      name: "",
      role: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Adegan</h3>
        <Button onClick={appendNewScene} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Adegan
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id} className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Adegan {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <FormField
              control={form.control}
              name={`scenes.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Adegan</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan judul adegan" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`scenes.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi adegan"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value ?? ""}
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
            <div className="space-y-2">
              <span className="font-medium">Karakter dalam Adegan</span>
              {sceneCharacterArrays[index].fields.map((charField, charIdx) => (
                <div key={charField.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nama Karakter"
                    value={(charField as any).name ?? ""}
                    onChange={e => sceneCharacterArrays[index].update(charIdx, { ...charField, name: e.target.value })}
                  />
                  <Input
                    placeholder="Peran/Role"
                    value={(charField as any).role ?? ""}
                    onChange={e => sceneCharacterArrays[index].update(charIdx, { ...charField, role: e.target.value })}
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => sceneCharacterArrays[index].remove(charIdx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={() => appendCharacterToScene(index)}>
                + Tambah Karakter
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 
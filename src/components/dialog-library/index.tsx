"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { DialogService } from "@/services/dialog-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CharacterService } from "@/services/character-service";

const formSchema = z.object({
  characterId: z.string().min(1, "Karakter harus dipilih"),
  text: z.string().min(1, "Dialog harus diisi"),
  bubbleType: z.enum(["speech", "thought", "whisper", "shout"]),
  emotion: z.string().min(1, "Emosi harus dipilih")
});

type FormValues = z.infer<typeof formSchema>;

const bubbleTypeOptions = [
  { value: "speech", label: "Speech Bubble" },
  { value: "thought", label: "Thought Bubble" },
  { value: "whisper", label: "Whisper Bubble" },
  { value: "shout", label: "Shout Bubble" }
];

const emotionOptions = [
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "angry", label: "Angry" },
  { value: "surprised", label: "Surprised" },
  { value: "scared", label: "Scared" },
  { value: "confused", label: "Confused" },
  { value: "neutral", label: "Neutral" }
];

export function DialogLibrary() {
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      characterId: "",
      text: "",
      bubbleType: "speech",
      emotion: ""
    }
  });

  useEffect(() => {
    loadDialogs();
    loadCharacters();
  }, []);

  const loadDialogs = async () => {
    try {
      const data = await DialogService.getAllDialogs();
      setDialogs(data);
    } catch (error) {
      console.error("Error loading dialogs:", error);
      showToast({
        title: "Error",
        description: "Gagal memuat dialog",
        variant: "destructive",
      });
    }
  };

  const loadCharacters = async () => {
    try {
      const data = await CharacterService.getAllCharacters();
      setCharacters(data);
    } catch (error) {
      console.error("Error loading characters:", error);
      showToast({
        title: "Error",
        description: "Gagal memuat karakter",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);
      await DialogService.saveDialog(data);
      showToast({
        title: "Sukses",
        description: "Dialog berhasil disimpan!",
      });
      form.reset();
      loadDialogs();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menyimpan dialog",
        variant: "destructive",
      });
      console.error("Error saving dialog:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDialog = async (id: string) => {
    try {
      await DialogService.deleteDialog(id);
      showToast({
        title: "Sukses",
        description: "Dialog berhasil dihapus!",
      });
      loadDialogs();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menghapus dialog",
        variant: "destructive",
      });
      console.error("Error deleting dialog:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Library Dialog</h3>
      </div>

      <Card className="p-6">
        <div>
          <FormField
            control={form.control}
            name="characterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Karakter</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih karakter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {characters.map((character) => (
                      <SelectItem key={character.id} value={character.id}>
                        {character.name}
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
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dialog</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan dialog"
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
            name="bubbleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Balon</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis balon" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bubbleTypeOptions.map((option) => (
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
            name="emotion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emosi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih emosi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {emotionOptions.map((option) => (
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

          <div className="flex justify-end">
            <Button type="button" disabled={isSaving} onClick={() => onSubmit(form.getValues())}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Menyimpan..." : "Simpan Dialog"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {dialogs.map((dialog) => {
          const character = characters.find(c => c.id === dialog.characterId);
          return (
            <Card key={dialog.id} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{character?.name || "Unknown Character"}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDialog(dialog.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{dialog.text}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {bubbleTypeOptions.find(opt => opt.value === dialog.bubbleType)?.label}
                  </Badge>
                  <Badge variant="secondary">
                    {emotionOptions.find(opt => opt.value === dialog.emotion)?.label}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 
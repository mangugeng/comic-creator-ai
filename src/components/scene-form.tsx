"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { PlusCircle, Info, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMemo, useCallback, useState, useEffect } from "react";
import { CharacterService } from "@/services/character-service";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { BackgroundService } from "@/services/background-service";
import { Input } from "@/components/ui/input";
import { ArtStyleService } from "@/services/art-style-service";

// Dropdown options
const expressionOptions = [
  { value: "happy", label: "Senang" },
  { value: "sad", label: "Sedih" },
  { value: "angry", label: "Marah" },
  { value: "surprised", label: "Terkejut" },
  { value: "neutral", label: "Netral" },
  { value: "scared", label: "Takut" },
  { value: "confused", label: "Bingung" },
  { value: "determined", label: "Bertekad" },
  { value: "excited", label: "Bersemangat" },
  { value: "tired", label: "Lelah" },
];

const actionOptions = [
  { value: "standing", label: "Berdiri" },
  { value: "sitting", label: "Duduk" },
  { value: "walking", label: "Berjalan" },
  { value: "running", label: "Berlari" },
  { value: "fighting", label: "Bertarung" },
  { value: "talking", label: "Berbicara" },
  { value: "listening", label: "Mendengarkan" },
  { value: "thinking", label: "Berpikir" },
  { value: "sleeping", label: "Tidur" },
  { value: "eating", label: "Makan" },
];

const interactionOptions = [
  { value: "talking_to", label: "Berbicara dengan" },
  { value: "looking_at", label: "Melihat" },
  { value: "pointing_at", label: "Menunjuk" },
  { value: "fighting_with", label: "Bertarung dengan" },
  { value: "helping", label: "Membantu" },
  { value: "following", label: "Mengikuti" },
  { value: "running_from", label: "Lari dari" },
  { value: "hiding_from", label: "Bersembunyi dari" },
  { value: "searching_for", label: "Mencari" },
  { value: "waiting_for", label: "Menunggu" },
];

const bodyPartOptions = [
  { value: "head", label: "Kepala" },
  { value: "face", label: "Wajah" },
  { value: "eyes", label: "Mata" },
  { value: "mouth", label: "Mulut" },
  { value: "hands", label: "Tangan" },
  { value: "arms", label: "Lengan" },
  { value: "legs", label: "Kaki" },
  { value: "chest", label: "Dada" },
  { value: "back", label: "Punggung" },
  { value: "whole_body", label: "Seluruh Badan" },
];

export const cameraAngleOptions = [
  { value: "front", label: "Depan" },
  { value: "side", label: "Samping" },
  { value: "back", label: "Belakang" },
  { value: "high_angle", label: "Sudut Tinggi" },
  { value: "low_angle", label: "Sudut Rendah" },
  { value: "close_up", label: "Close Up" },
  { value: "wide_shot", label: "Wide Shot" },
  { value: "over_shoulder", label: "Over Shoulder" },
  { value: "bird_eye", label: "Bird's Eye View" },
  { value: "dutch_angle", label: "Dutch Angle" },
];

export const lightingOptions = [
  { value: "natural", label: "Natural" },
  { value: "dramatic", label: "Dramatis" },
  { value: "soft", label: "Soft" },
  { value: "harsh", label: "Keras" },
  { value: "backlit", label: "Backlit" },
  { value: "rim_light", label: "Rim Light" },
  { value: "low_key", label: "Low Key" },
  { value: "high_key", label: "High Key" },
  { value: "colored", label: "Berwarna" },
  { value: "noir", label: "Noir" },
];

export const styleOptions = [
  { value: "realistic", label: "Realistis" },
  { value: "cartoon", label: "Kartun" },
  { value: "anime", label: "Anime" },
  { value: "comic", label: "Komik" },
  { value: "watercolor", label: "Cat Air" },
  { value: "sketch", label: "Sketsa" },
  { value: "pixel", label: "Pixel Art" },
  { value: "3d", label: "3D" },
  { value: "vector", label: "Vektor" },
  { value: "painterly", label: "Lukisan" },
];

const effectOptions = [
  { value: "none", label: "Tidak Ada" },
  { value: "blur", label: "Blur" },
  { value: "glow", label: "Glow" },
  { value: "smoke", label: "Asap" },
  { value: "fire", label: "Api" },
  { value: "water", label: "Air" },
  { value: "wind", label: "Angin" },
  { value: "rain", label: "Hujan" },
  { value: "snow", label: "Salju" },
  { value: "particles", label: "Partikel" },
];

export const timeOptions = [
  { value: "morning", label: "Pagi" },
  { value: "noon", label: "Siang" },
  { value: "afternoon", label: "Sore" },
  { value: "evening", label: "Petang" },
  { value: "night", label: "Malam" },
  { value: "dawn", label: "Fajar" },
  { value: "dusk", label: "Senja" },
];

export const atmosphereOptions = [
  { value: "clear", label: "Cerah" },
  { value: "cloudy", label: "Berawan" },
  { value: "rainy", label: "Hujan" },
  { value: "foggy", label: "Berkabut" },
  { value: "stormy", label: "Badai" },
  { value: "sunny", label: "Terik" },
  { value: "dark", label: "Gelap" },
  { value: "mysterious", label: "Misterius" },
  { value: "peaceful", label: "Tenang" },
  { value: "tense", label: "Mencekam" },
];

const soundFXOptions = [
  { value: "none", label: "Tidak Ada" },
  { value: "whoosh", label: "Whoosh" },
  { value: "bang", label: "Bang" },
  { value: "boom", label: "Boom" },
  { value: "crash", label: "Crash" },
  { value: "splash", label: "Splash" },
  { value: "thud", label: "Thud" },
  { value: "custom", label: "Custom" },
];

const lineFXOptions = [
  { value: "none", label: "Tidak Ada" },
  { value: "speed_lines", label: "Speed Lines" },
  { value: "impact_lines", label: "Impact Lines" },
  { value: "motion_lines", label: "Motion Lines" },
  { value: "focus_lines", label: "Focus Lines" },
  { value: "energy_lines", label: "Energy Lines" },
  { value: "custom", label: "Custom" },
];

const speechBubbleOptions = [
  { value: "normal", label: "Normal" },
  { value: "thought", label: "Pikiran" },
  { value: "whisper", label: "Bisikan" },
  { value: "shout", label: "Teriakan" },
  { value: "narrator", label: "Narator" },
  { value: "system", label: "System" },
];

const textureOptions = [
  { value: "halus", label: "Halus" },
  { value: "kasar", label: "Kasar" },
  { value: "gradasi", label: "Gradasi" },
  { value: "polos", label: "Polos" },
  { value: "bertekstur", label: "Bertekstur" },
  { value: "berpola", label: "Berpola" },
  { value: "abstrak", label: "Abstrak" },
];

export const defaultBackgroundOptions = [
  { value: "kota", label: "Kota" },
  { value: "desa", label: "Desa" },
  { value: "gunung", label: "Gunung" },
  { value: "pantai", label: "Pantai" },
  { value: "hutan", label: "Hutan" },
  { value: "sekolah", label: "Sekolah" },
  { value: "rumah", label: "Rumah" },
  { value: "jalan", label: "Jalan" },
  { value: "taman", label: "Taman" },
  { value: "kantor", label: "Kantor" },
];

const vfxOptions = [
  { value: "none", label: "Tidak Ada" },
  { value: "blur", label: "Blur" },
  { value: "glow", label: "Glow" },
  { value: "smoke", label: "Asap" },
  { value: "fire", label: "Api" },
  { value: "water", label: "Air" },
  { value: "rain", label: "Hujan" },
  { value: "snow", label: "Salju" },
  { value: "particles", label: "Partikel" },
];

const motionFXOptions = [
  { value: "none", label: "Tidak Ada" },
  { value: "speed_lines", label: "Speed Lines" },
  { value: "motion_blur", label: "Motion Blur" },
  { value: "impact_lines", label: "Impact Lines" },
  { value: "focus_lines", label: "Focus Lines" },
  { value: "energy_lines", label: "Energy Lines" },
];

const soundFXOptionsScene = [
  { value: "none", label: "Tidak Ada" },
  { value: "whoosh", label: "Whoosh" },
  { value: "bang", label: "Bang" },
  { value: "boom", label: "Boom" },
  { value: "crash", label: "Crash" },
  { value: "splash", label: "Splash" },
  { value: "thud", label: "Thud" },
  { value: "custom", label: "Custom" },
];

const panelSizeOptions = [
  { value: "kecil", label: "Kecil" },
  { value: "sedang", label: "Sedang" },
  { value: "besar", label: "Besar" },
];
const panelRatioOptions = [
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "16:9", label: "16:9" },
  { value: "2:1", label: "2:1" },
  { value: "3:2", label: "3:2" },
  { value: "9:16", label: "9:16" },
];
const panelTypeOptions = [
  { value: "biasa", label: "Biasa" },
  { value: "splash", label: "Splash" },
  { value: "inset", label: "Inset" },
  { value: "overlap", label: "Overlap" },
  { value: "borderless", label: "Borderless" },
];

const panelOrientationOptions = [
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
];

const latarOrangOptions = [
  { value: "none", label: "Tidak ada orang" },
  { value: "ramai", label: "Ramai orang" },
  { value: "beberapa", label: "Beberapa orang" },
  { value: "satu", label: "Satu orang" },
  { value: "kerumunan", label: "Kerumunan" },
  { value: "keluarga", label: "Keluarga" },
  { value: "teman", label: "Teman" },
];

const renderQualityOptions = [
  { value: "simple", label: "Simple" },
  { value: "normal", label: "Biasa" },
  { value: "detail", label: "Detail" },
  { value: "high_detail", label: "High Detail" },
  { value: "artistic", label: "Artistic" },
];

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
  interaksiObjek?: string;
}

interface SceneField {
  id: string;
  characters: SceneCharacter[];
  background: string;
  time: string;
  atmosphere: string;
  style: string;
  styleCustom: string;
  cameraAngle: string;
  lighting: string;
  soundFX: string;
  soundFXCustom: string;
  lineFX: string;
  lineFXCustom: string;
  texture?: string;
  vfx?: string;
  motionFX?: string;
  soundFXScene?: string;
  soundFXSceneCustom?: string;
  ukuranPanel?: string;
  rasioPanel?: string;
  jenisPanel?: string;
  orientasiPanel?: string;
  latarOrang?: string;
  detailVisual?: string;
  komposisiVisual?: string;
  fokusKamera?: string;
  gerakanTubuh?: string;
  gayaTeksDialog?: string;
  letakDialog?: string;
  warnaDialog?: string;
  efekSuaraCustom?: string;
  detailLatar?: string;
  pencahayaanDetail?: string;
  arahPencahayaan?: string;
  komposisiKarakter?: string;
  efekMotionBlur?: string;
  efekDepth?: string;
  detailVFX?: string;
  detailMotionFX?: string;
  detailSoundFX?: string;
  detailTekstur?: string;
  detailWarna?: string;
  detailGaya?: string;
  renderQuality?: string;
}

interface Character {
  id: string;
  name: string;
  physical: string;
  clothing?: string;
  isBackground: boolean;
}

interface FormValues {
  characters: Character[];
  scenes: SceneField[];
}

export function SceneForm() {
  const form = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray<FormValues>({
    control: form.control,
    name: "scenes"
  });

  // Hydration fix: Only generate IDs on client after mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const [storedCharacters, setStoredCharacters] = useState<Character[]>([]);
  const [backgroundOptions, setBackgroundOptions] = useState<{id: string, name: string}[]>([]);
  const { showToast } = useToast();
  const [artStyleSource, setArtStyleSource] = useState<'default' | 'storage'>('default');
  const [artStyleStorageOptions, setArtStyleStorageOptions] = useState<{id: string, name: string}[]>([]);
  const [backgroundSource, setBackgroundSource] = useState<'default' | 'library'>('default');

  useEffect(() => {
    // Load characters from storage on component mount
    const loadCharacters = async () => {
      try {
        const chars = await CharacterService.getAllCharacters();
        setStoredCharacters(chars);
      } catch (error) {
        showToast({
          title: "Error",
          description: "Gagal memuat daftar karakter",
          variant: "destructive",
        });
      }
    };
    loadCharacters();
    // Load backgrounds from storage
    const loadBackgrounds = async () => {
      try {
        const bgs = await BackgroundService.getAllBackgrounds();
        setBackgroundOptions(bgs.map(bg => ({ id: bg.id, name: bg.name })));
      } catch (error) {
        showToast({
          title: "Error",
          description: "Gagal memuat daftar background",
          variant: "destructive",
        });
      }
    };
    loadBackgrounds();
    // Load art styles from storage
    const loadArtStyles = async () => {
      try {
        const styles = await ArtStyleService.getAllArtStyles();
        setArtStyleStorageOptions(styles.map(s => ({ id: s.id, name: s.name })));
      } catch (error) {
        showToast({
          title: "Error",
          description: "Gagal memuat daftar gaya artistik",
          variant: "destructive",
        });
      }
    };
    loadArtStyles();
  }, [showToast]);

  // Use useMemo to prevent unnecessary re-renders
  const characters = useMemo(() => {
    // Combine form characters with stored characters
    const formChars = form.getValues("characters") || [];
    const allChars = [...formChars, ...storedCharacters];
    // Remove duplicates based on id
    return allChars.filter((char, index, self) => 
      index === self.findIndex((c) => c.id === char.id)
    );
  }, [form, storedCharacters]);

  // Ensure only one scene exists, and only append after mount
  useEffect(() => {
    if (isMounted && fields.length === 0) {
      append({
        id: crypto.randomUUID(),
        characters: [],
        background: "",
        time: "",
        atmosphere: "",
        style: "",
        styleCustom: "",
        cameraAngle: "",
        lighting: "",
        soundFX: "",
        soundFXCustom: "",
        lineFX: "",
        lineFXCustom: "",
        texture: "",
        vfx: "",
        motionFX: "",
        soundFXScene: "",
        soundFXSceneCustom: "",
        ukuranPanel: "",
        rasioPanel: "",
        jenisPanel: "",
        orientasiPanel: "",
        latarOrang: "",
        detailVisual: "",
        komposisiVisual: "",
        fokusKamera: "",
        gerakanTubuh: "",
        gayaTeksDialog: "",
        letakDialog: "",
        warnaDialog: "",
        efekSuaraCustom: "",
        detailLatar: "",
        pencahayaanDetail: "",
        arahPencahayaan: "",
        komposisiKarakter: "",
        efekMotionBlur: "",
        efekDepth: "",
        detailVFX: "",
        detailMotionFX: "",
        detailSoundFX: "",
        detailTekstur: "",
        detailWarna: "",
        detailGaya: "",
        renderQuality: "",
      });
    } else if (fields.length > 1) {
      // Remove extra scenes if any
      for (let i = fields.length - 1; i > 0; i--) {
        remove(i);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length, isMounted]);

  // Memoize character options to prevent unnecessary re-renders
  const characterOptions = useMemo(() => 
    characters.map(character => ({
      value: character.id,
      label: character.name
    })), [characters]);

  // Add character to scene only after mount
  const addCharacterToScene = useCallback((sceneIndex: number) => {
    if (!isMounted) return;
    const scene = form.getValues(`scenes.${sceneIndex}`);
    const updatedCharacters = [...(scene.characters || []), {
      id: crypto.randomUUID(),
      characterId: "",
      expression: "",
      action: "",
      interaction: "",
      interactionTarget: "",
      interactionBodyPart: "",
      dialog: "",
      speechBubbleType: "",
      interaksiObjek: "",
    }];
    form.setValue(`scenes.${sceneIndex}.characters`, updatedCharacters);
  }, [form, isMounted]);

  const removeCharacterFromScene = useCallback((sceneIndex: number, characterIndex: number) => {
    const scene = form.getValues(`scenes.${sceneIndex}`);
    const updatedCharacters = scene.characters.filter((_: any, index: number) => index !== characterIndex);
    form.setValue(`scenes.${sceneIndex}.characters`, updatedCharacters);
  }, [form]);

  return (
    <div className="space-y-6">
      {/* Scene Details */}
      <div>
        <div className="space-y-4">
          {fields.slice(0, 1).map((field, sceneIndex) => (
            <Card key={field.id} className="p-6 bg-white/80 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Characters */}
                <div>
                  <div className="mb-4 border-b pb-2">
                    <h3 className="text-base font-semibold text-primary">Karakter dalam Adegan</h3>
                    <p className="text-xs text-muted-foreground">Atur karakter, dialog, dan interaksi dalam adegan ini.</p>
                  </div>
                  <div className="space-y-4">
                    {form.watch(`scenes.${sceneIndex}.characters`)?.map((character, charIndex) => (
                      <Card key={character.id} className="p-4 border border-muted bg-muted/50">
                        <div className="flex gap-2 items-center justify-between mb-2">
                          <span className="font-medium text-sm">Karakter {charIndex + 1}</span>
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeCharacterFromScene(sceneIndex, charIndex)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <FormField
                            control={form.control}
                            name={`scenes.${sceneIndex}.characters.${charIndex}.characterId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Karakter</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value ?? ""}
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
                            name={`scenes.${sceneIndex}.characters.${charIndex}.expression`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ekspresi</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value ?? ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih ekspresi" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {expressionOptions.map((option) => (
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
                            name={`scenes.${sceneIndex}.characters.${charIndex}.action`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aksi</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value ?? ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih aksi" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {actionOptions.map((option) => (
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
                            name={`scenes.${sceneIndex}.characters.${charIndex}.interaction`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Interaksi</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value ?? ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih interaksi" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {interactionOptions.map((option) => (
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
                            name={`scenes.${sceneIndex}.characters.${charIndex}.interactionTarget`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Interaksi</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value ?? ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih target interaksi" />
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
                            name={`scenes.${sceneIndex}.characters.${charIndex}.interactionBodyPart`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bagian Tubuh</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value ?? ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih bagian tubuh" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {bodyPartOptions.map((option) => (
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
                            name={`scenes.${sceneIndex}.characters.${charIndex}.speechBubbleType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jenis Balon Text</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value ?? ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih jenis balon text" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {speechBubbleOptions.map((option) => (
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
                            name={`scenes.${sceneIndex}.characters.${charIndex}.dialog`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dialog</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan dialog" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`scenes.${sceneIndex}.characters.${charIndex}.interaksiObjek`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Interaksi dengan Objek/Benda Mati</FormLabel>
                                <FormControl>
                                  <Input placeholder="Contoh: memegang payung, membawa peti" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => {
                        if (!isMounted) return;
                        const current = form.watch(`scenes.${sceneIndex}.characters`) || [];
                        const newChar = {
                          id: crypto.randomUUID(),
                          characterId: "",
                          expression: "",
                          action: "",
                          interaction: "",
                          interactionTarget: "",
                          interactionBodyPart: "",
                          dialog: "",
                          speechBubbleType: "",
                          interaksiObjek: "",
                        };
                        form.setValue(`scenes.${sceneIndex}.characters`, [...current, newChar]);
                        form.trigger();
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />Tambah Karakter
                    </Button>
                  </div>
                </div>

                {/* Right Column - Scene Details */}
                <div>
                  <div className="mb-4 border-b pb-2">
                    <h3 className="text-base font-semibold text-primary">Detail Adegan</h3>
                    <p className="text-xs text-muted-foreground">Atur latar, waktu, atmosfer, gaya artistik, kamera, dan pencahayaan.</p>
                  </div>
                  <div className="space-y-6">
                    {/* Background Section */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Background & Waktu</h4>
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            name="backgroundSource"
                            value="default"
                            checked={backgroundSource === 'default'}
                            onChange={() => setBackgroundSource('default')}
                          />
                          Bawaan
                        </label>
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            name="backgroundSource"
                            value="library"
                            checked={backgroundSource === 'library'}
                            onChange={() => setBackgroundSource('library')}
                          />
                          Library
                        </label>
                      </div>
                      {backgroundSource === 'default' ? (
                        <FormField
                          control={form.control}
                          name="scenes.0.background"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Background</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih background bawaan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {defaultBackgroundOptions.map((option) => (
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
                      ) : (
                        <FormField
                          control={form.control}
                          name="scenes.0.background"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Background (Library)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih background dari library" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {backgroundOptions.map((option) => (
                                    <SelectItem key={option.id} value={option.id}>
                                      {option.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {/* Latar Orang */}
                      <FormField
                        control={form.control}
                        name="scenes.0.latarOrang"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latar Orang</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih latar orang" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {latarOrangOptions.map((option) => (
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
                        name="scenes.0.time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Waktu</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih waktu" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
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
                        name="scenes.0.atmosphere"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Atmosfir</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih atmosfir" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {atmosphereOptions.map((option) => (
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
                    </Card>
                    {/* Detail Visual */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Detail Visual</h4>
                      <FormField
                        control={form.control}
                        name="scenes.0.detailVisual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail Visual</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Jalan tanah, rumah-rumah kayu berderet, pagar bambu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.detailLatar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail Latar</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Ayam lewat, anak-anak bermain di kejauhan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.pencahayaanDetail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail Pencahayaan</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Sinar matahari lembut dari kanan atas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.arahPencahayaan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Arah Pencahayaan</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Dari kanan atas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                    {/* Artistic Style Section */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Gaya Artistik</h4>
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            name="artStyleSource"
                            value="default"
                            checked={artStyleSource === 'default'}
                            onChange={() => setArtStyleSource('default')}
                          />
                          Bawaan
                        </label>
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            name="artStyleSource"
                            value="storage"
                            checked={artStyleSource === 'storage'}
                            onChange={() => setArtStyleSource('storage')}
                          />
                          Library
                        </label>
                      </div>
                      {artStyleSource === 'default' ? (
                        <FormField
                          control={form.control}
                          name="scenes.0.style"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gaya Artistik</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  if (value !== "custom") {
                                    form.setValue("scenes.0.styleCustom", "");
                                  }
                                }}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih gaya artistik" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {styleOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="scenes.0.style"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gaya Artistik (Library)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih gaya artistik dari library" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {artStyleStorageOptions.map((option) => (
                                    <SelectItem key={option.id} value={option.id}>
                                      {option.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {artStyleSource === 'default' && form.watch("scenes.0.style") === "custom" && (
                        <FormField
                          control={form.control}
                          name="scenes.0.styleCustom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Style</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan gaya artistik custom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {/* Dropdown Tekstur */}
                      <FormField
                        control={form.control}
                        name="scenes.0.texture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tekstur</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih tekstur" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {textureOptions.map((option) => (
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
                      {/* VFX */}
                      <FormField
                        control={form.control}
                        name="scenes.0.vfx"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VFX (Visual FX)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih VFX" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vfxOptions.map((option) => (
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
                      {/* Motion FX */}
                      <FormField
                        control={form.control}
                        name="scenes.0.motionFX"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motion FX</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Motion FX" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {motionFXOptions.map((option) => (
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
                      {/* Sound FX */}
                      <FormField
                        control={form.control}
                        name="scenes.0.soundFXScene"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sound FX</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                if (value !== "custom") {
                                  form.setValue("scenes.0.soundFXSceneCustom", "");
                                }
                              }}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Sound FX" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {soundFXOptionsScene.map((option) => (
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
                      {form.watch("scenes.0.soundFXScene") === "custom" && (
                        <FormField
                          control={form.control}
                          name="scenes.0.soundFXSceneCustom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Sound FX</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan sound effect custom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </Card>
                    {/* Detail Efek */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Detail Efek</h4>
                      <FormField
                        control={form.control}
                        name="scenes.0.detailVFX"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail VFX</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Debu kecil mengepul di bawah kaki" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.detailMotionFX"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail Motion FX</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Speed lines sejajar arah gerak" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.detailSoundFX"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail Sound FX</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: WHOOOOSSSS besar dan menyapu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.efekSuaraCustom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Efek Suara Custom</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Efek suara kustom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                    {/* Camera and Lighting Section */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Kamera & Pencahayaan</h4>
                      <FormField
                        control={form.control}
                        name="scenes.0.cameraAngle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sudut Kamera</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih sudut kamera" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cameraAngleOptions.map((option) => (
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
                        name="scenes.0.lighting"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pencahayaan</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih pencahayaan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {lightingOptions.map((option) => (
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
                      {/* Panel Layout */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="scenes.0.ukuranPanel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ukuran Panel</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih ukuran panel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {panelSizeOptions.map((option) => (
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
                          name="scenes.0.rasioPanel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rasio Panel</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih rasio panel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {panelRatioOptions.map((option) => (
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
                          name="scenes.0.jenisPanel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jenis Panel</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis panel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {panelTypeOptions.map((option) => (
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
                          name="scenes.0.orientasiPanel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Orientasi Panel</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih orientasi panel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {panelOrientationOptions.map((option) => (
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
                      </div>
                    </Card>
                    {/* Komposisi & Kamera */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Komposisi & Kamera</h4>
                      <FormField
                        control={form.control}
                        name="scenes.0.komposisiVisual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Komposisi Visual</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Karakter di sepertiga kiri bawah panel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.komposisiKarakter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Komposisi Karakter</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Posisi karakter dalam panel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.fokusKamera"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fokus Kamera</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Shallow focus — karakter tajam, latar belakang blur" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.efekMotionBlur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Efek Motion Blur</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Motion blur mengarah ke kanan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.efekDepth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Efek Depth</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Latar belakang sedikit blur untuk efek depth" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                    {/* Gaya Dialog */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Gaya Dialog</h4>
                      <FormField
                        control={form.control}
                        name="scenes.0.gayaTeksDialog"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gaya Teks Dialog</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Huruf kapital, bergelombang, tebal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.letakDialog"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Letak Dialog</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Di atas karakter, sedikit miring" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.warnaDialog"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warna Dialog</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Warna kontras dengan latar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                    {/* Detail Gaya Visual */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Detail Gaya Visual</h4>
                      <FormField
                        control={form.control}
                        name="scenes.0.detailGaya"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail Gaya</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Detail tambahan gaya artistik" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.detailTekstur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail Tekstur</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Goresan kuas tampak jelas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scenes.0.detailWarna"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detail Warna</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Gradasi warna hangat" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                    {/* Tingkat Render */}
                    <Card className="p-4 bg-muted/40">
                      <h4 className="font-medium mb-2">Tingkat Render</h4>
                      <FormField
                        control={form.control}
                        name="scenes.0.renderQuality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tingkat Detail Render</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih tingkat render" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {renderQualityOptions.map((option) => (
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
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
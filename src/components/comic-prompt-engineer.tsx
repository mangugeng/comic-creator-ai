"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CharacterList } from "@/components/character-list";
import { SceneForm } from "@/components/scene-form";
import { BackgroundLibrary } from "@/components/background-library";
import { DialogLibrary } from "@/components/dialog-library";
import { ArtStyleLibrary } from "@/components/art-style-library";
import { EffectLibrary } from "@/components/effect-library";
import { CharacterService } from "@/services/character-service";
import { BackgroundService } from "@/services/background-service";
import { ArtStyleService } from "@/services/art-style-service";
import { Copy, Save } from "lucide-react";
import { styleOptions, defaultBackgroundOptions, timeOptions, atmosphereOptions, cameraAngleOptions, lightingOptions } from "@/components/scene-form";

const formSchema = z.object({
  characters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    physical: z.string(),
    clothing: z.string().optional(),
    isBackground: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string()
  })),
  scenes: z.array(z.object({
    id: z.string(),
    characters: z.array(z.any()).optional(),
    cameraAngle: z.string().optional(),
    lighting: z.string().optional(),
    background: z.string().optional(),
    style: z.string().optional(),
    styleCustom: z.string().optional(),
    time: z.string().optional(),
    atmosphere: z.string().optional(),
    texture: z.string().optional(),
    vfx: z.string().optional(),
    motionFX: z.string().optional(),
    soundFXScene: z.string().optional(),
    soundFXSceneCustom: z.string().optional(),
    effects: z.array(z.string()).optional(),
    ukuranPanel: z.string().optional(),
    rasioPanel: z.string().optional(),
    jenisPanel: z.string().optional(),
    orientasiPanel: z.string().optional(),
    latarOrang: z.string().optional(),
    detailVisual: z.string().optional(),
    komposisiVisual: z.string().optional(),
    fokusKamera: z.string().optional(),
    gerakanTubuh: z.string().optional(),
    gayaTeksDialog: z.string().optional(),
    letakDialog: z.string().optional(),
    warnaDialog: z.string().optional(),
    efekSuaraCustom: z.string().optional(),
    detailLatar: z.string().optional(),
    pencahayaanDetail: z.string().optional(),
    arahPencahayaan: z.string().optional(),
    komposisiKarakter: z.string().optional(),
    efekMotionBlur: z.string().optional(),
    efekDepth: z.string().optional(),
    detailVFX: z.string().optional(),
    detailMotionFX: z.string().optional(),
    detailSoundFX: z.string().optional(),
    detailTekstur: z.string().optional(),
    detailWarna: z.string().optional(),
    detailGaya: z.string().optional(),
    renderQuality: z.string().optional(),
  }))
});

type FormValues = z.infer<typeof formSchema>;

export function ComicPromptEngineer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      characters: [],
      scenes: []
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsGenerating(true);
      // Ambil data karakter dan background dari storage
      const storedCharacters = await CharacterService.getAllCharacters();
      const storedBackgrounds = await BackgroundService.getAllBackgrounds();
      const storedArtStyles = await ArtStyleService.getAllArtStyles();
      const scenes = data.scenes || [];
      const scene = scenes[0] || {};
      const sceneCharacters = scene.characters || [];

      // Get character details from storage
      const characterDetails = sceneCharacters.map((char: any, idx: number) => {
        const character = storedCharacters.find((c) => c.id === char.characterId);
        return {
          name: character?.name || "Unknown Character",
          physical: character?.physical || "",
          clothing: character?.clothing || "",
          expression: char.expression || "",
          action: char.action || "",
          interaction: char.interaction || "",
          interactionTarget: storedCharacters.find((c) => c.id === char.interactionTarget)?.name || "",
          bodyPart: char.interactionBodyPart || "",
          interaksiObjek: char.interaksiObjek || ""
        };
      });

      // Get background details from storage
      let backgroundName = "";
      let backgroundDesc = "";
      if (scene.background) {
        const bg = storedBackgrounds.find((b) => b.id === scene.background || b.name === scene.background);
        if (bg) {
          backgroundName = bg.name;
          backgroundDesc = bg.description;
        }
      }

      // Build the prompt
      let prompt = "PROMPT KOMIK PANEL\n\n";
      prompt += "🧑‍🎤 KARAKTER UTAMA\n\n";
      characterDetails.forEach((char, index) => {
        prompt += `Nama/Identitas: ${char.name}\n\n`;
        prompt += `Deskripsi fisik: ${char.physical}\n\n`;
        prompt += `Pakaian: ${char.clothing}\n\n`;
        prompt += `Ekspresi wajah: ${char.expression}\n\n`;
        prompt += `Aksi saat ini: ${char.action}\n\n`;
        if (char.interaksiObjek) {
          prompt += `Interaksi objek: ${char.interaksiObjek}\n\n`;
        }
        if (char.interaction && char.interactionTarget) {
          prompt += `Interaksi: ${char.name} ${char.interaction} ${char.bodyPart} ${char.interactionTarget}\n\n`;
        }
        if ((scene as any).gerakanTubuh) {
          prompt += `Gerakan tubuh: ${(scene as any).gerakanTubuh}\n\n`;
        }
      });

      // Add background section
      prompt += "🖼️ LATAR (BACKGROUND)\n\n";
      let backgroundLabel = "";
      const defaultBg = defaultBackgroundOptions.find((opt: any) => opt.value === (scene as any).background);
      const libraryBg = storedBackgrounds.find((opt: any) => opt.id === (scene as any).background);
      if (defaultBg) {
        backgroundLabel = defaultBg.label;
      } else if (libraryBg) {
        backgroundLabel = libraryBg.name;
      } else {
        backgroundLabel = (scene as any).background || "-";
      }
      prompt += `Nama lokasi: ${backgroundLabel}\n\n`;
      prompt += `Detail visual: ${(scene as any).detailVisual || (libraryBg ? (libraryBg.description || "-") : "-")}\n\n`;
      if ((scene as any).detailLatar) {
        prompt += `Detail latar: ${(scene as any).detailLatar}\n\n`;
      }
      // Waktu
      let waktuLabel = "-";
      const waktuOpt = timeOptions.find((opt: any) => opt.value === (scene as any).time);
      if (waktuOpt) waktuLabel = waktuOpt.label;
      prompt += `Waktu: ${waktuLabel}\n\n`;
      // Atmosfer
      let atmosferLabel = "-";
      const atmosferOpt = atmosphereOptions.find((opt: any) => opt.value === (scene as any).atmosphere);
      if (atmosferOpt) atmosferLabel = atmosferOpt.label;
      prompt += `Cuaca: ${atmosferLabel}\n\n`;
      if ((scene as any).pencahayaanDetail) {
        prompt += `Pencahayaan detail: ${(scene as any).pencahayaanDetail}\n\n`;
      }
      if ((scene as any).arahPencahayaan) {
        prompt += `Arah pencahayaan: ${(scene as any).arahPencahayaan}\n\n`;
      }
      // Latar Orang
      let latarOrangLabel = "-";
      const latarOrangOptions = [
        { value: "none", label: "Tidak ada orang" },
        { value: "ramai", label: "Ramai orang" },
        { value: "beberapa", label: "Beberapa orang" },
        { value: "satu", label: "Satu orang" },
        { value: "kerumunan", label: "Kerumunan" },
        { value: "keluarga", label: "Keluarga" },
        { value: "teman", label: "Teman" },
      ];
      const latarOrangOpt = latarOrangOptions.find((opt: any) => opt.value === (scene as any).latarOrang);
      if (latarOrangOpt) latarOrangLabel = latarOrangOpt.label;
      prompt += `Orang sekitar: ${latarOrangLabel}\n\n`;

      // Add camera and panel section
      prompt += "📷 KAMERA & PANEL\n\n";
      prompt += `Jenis panel: ${(scene as any).jenisPanel || "-"}\n\n`;
      prompt += `Ukuran panel: ${(scene as any).ukuranPanel || "-"}\n\n`;
      prompt += `Rasio panel: ${(scene as any).rasioPanel || "-"}\n\n`;
      prompt += `Orientasi: ${(scene as any).orientasiPanel || "-"}\n\n`;
      const cameraLabel = cameraAngleOptions.find((opt: any) => opt.value === (scene as any).cameraAngle)?.label || "-";
      prompt += `Sudut kamera: ${cameraLabel}\n\n`;
      if ((scene as any).komposisiVisual) {
        prompt += `Komposisi visual: ${(scene as any).komposisiVisual}\n\n`;
      }
      if ((scene as any).komposisiKarakter) {
        prompt += `Komposisi karakter: ${(scene as any).komposisiKarakter}\n\n`;
      }
      if ((scene as any).fokusKamera) {
        prompt += `Fokus kamera: ${(scene as any).fokusKamera}\n\n`;
      }
      if ((scene as any).efekMotionBlur) {
        prompt += `Efek motion blur: ${(scene as any).efekMotionBlur}\n\n`;
      }
      if ((scene as any).efekDepth) {
        prompt += `Efek depth: ${(scene as any).efekDepth}\n\n`;
      }

      // Add FX section
      prompt += "✨ EFEK (FX)\n\n";
      prompt += `Visual FX (VFX): ${(scene as any).vfx || "-"}\n\n`;
      if ((scene as any).detailVFX) {
        prompt += `Detail VFX: ${(scene as any).detailVFX}\n\n`;
      }
      prompt += `Motion FX: ${(scene as any).motionFX || "-"}\n\n`;
      if ((scene as any).detailMotionFX) {
        prompt += `Detail Motion FX: ${(scene as any).detailMotionFX}\n\n`;
      }
      let soundFXLabel = "-";
      if ((scene as any).soundFXScene === "custom" && (scene as any).soundFXSceneCustom) {
        soundFXLabel = (scene as any).soundFXSceneCustom;
      } else if ((scene as any).soundFXScene && (scene as any).soundFXScene !== "none") {
        soundFXLabel = (scene as any).soundFXScene;
      }
      prompt += `Sound FX: ${soundFXLabel}\n\n`;
      if ((scene as any).detailSoundFX) {
        prompt += `Detail Sound FX: ${(scene as any).detailSoundFX}\n\n`;
      }
      if ((scene as any).efekSuaraCustom) {
        prompt += `Efek suara custom: ${(scene as any).efekSuaraCustom}\n\n`;
      }

      // Add dialog section
      prompt += "💬 DIALOG & TEKS\n\n";
      prompt += "Dialog karakter:\n\n";
      const dialogLines = sceneCharacters
        .filter((char: any) => char.dialog && char.dialog.trim() !== "")
        .map((char: any) => {
          const character = storedCharacters.find((c) => c.id === char.characterId);
          const name = character?.name || "Karakter";
          const speechBubbleType = char.speechBubbleType || "normal";
          const speechBubbleLabels: Record<string, string> = {
            normal: "Normal",
            thought: "Pikiran",
            whisper: "Bisikan",
            shout: "Teriakan",
            narrator: "Narator",
            system: "System"
          };
          const speechBubbleLabel = speechBubbleLabels[speechBubbleType] || "Normal";
          return `${name} (${speechBubbleLabel}):\n"${char.dialog}"`;
        });
      if (dialogLines.length > 0) {
        prompt += dialogLines.join("\n\n");
      } else {
        prompt += "-\n";
      }
      prompt += `\n\nEfek suara: ${soundFXLabel}\n\n`;
      if ((scene as any).gayaTeksDialog) {
        prompt += `Gaya teks dialog: ${(scene as any).gayaTeksDialog}\n\n`;
      }
      if ((scene as any).letakDialog) {
        prompt += `Letak dialog: ${(scene as any).letakDialog}\n\n`;
      }
      if ((scene as any).warnaDialog) {
        prompt += `Warna dialog: ${(scene as any).warnaDialog}\n\n`;
      }

      // Add artistic style section
      prompt += "🎨 GAYA VISUAL\n\n";
      let styleLabel = "";
      const artStyleFromStorage = storedArtStyles.find(s => s.id === scene.style);
      if (artStyleFromStorage) {
        styleLabel = `${artStyleFromStorage.name} - ${artStyleFromStorage.characteristics.join(", ")}`;
      } else {
        const styleOpt = styleOptions.find((opt: any) => opt.value === scene.style);
        if (styleOpt) {
          styleLabel = styleOpt.label;
        } else if (scene.style === "custom" && (scene as any).styleCustom) {
          styleLabel = (scene as any).styleCustom;
        } else {
          styleLabel = scene.style || "";
        }
      }
      prompt += `Referensi gaya: ${styleLabel}\n\n`;
      if ((scene as any).detailGaya) {
        prompt += `Detail gaya: ${(scene as any).detailGaya}\n\n`;
      }
      prompt += `Tekstur: ${(scene as any).texture || "-"}\n\n`;
      if ((scene as any).detailTekstur) {
        prompt += `Detail tekstur: ${(scene as any).detailTekstur}\n\n`;
      }
      prompt += `Warna: ${(scene as any).detailWarna || "full-color"}\n\n`;

      // Add final instruction based on render quality
      const renderQuality = (scene as any).renderQuality || "normal";
      const renderInstructions = {
        simple: "Buat gambar dengan detail minimal namun tetap menarik.",
        normal: "Buat gambar berkualitas baik dengan detail yang cukup.",
        detail: "Buat gambar berkualitas tinggi dengan detail yang kaya dan komposisi yang menarik.",
        high_detail: "Buat gambar berkualitas sangat tinggi dengan detail yang sangat kaya, komposisi yang menarik, dan fokus pada setiap elemen visual.",
        artistic: "Buat gambar dengan pendekatan artistik yang kuat, detail yang kaya, dan komposisi yang menonjolkan nilai estetika."
      };
      prompt += renderInstructions[renderQuality as keyof typeof renderInstructions] || renderInstructions.normal;

      setGeneratedPrompt(prompt);
      showToast({
        title: "Sukses",
        description: "Prompt berhasil dibuat!",
      });
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal membuat prompt",
        variant: "destructive",
      });
      console.error("Error generating prompt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      showToast({ title: "Disalin!", description: "Prompt berhasil disalin ke clipboard." });
    }
  };

  const handleSavePrompt = () => {
    if (generatedPrompt) {
      const savedPrompts = JSON.parse(localStorage.getItem("saved_prompts") || "[]");
      savedPrompts.push({ prompt: generatedPrompt, date: new Date().toISOString() });
      localStorage.setItem("saved_prompts", JSON.stringify(savedPrompts));
      showToast({ title: "Tersimpan!", description: "Prompt berhasil disimpan." });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-[3fr_2fr] gap-6">
          <div className="space-y-6">
            <Tabs defaultValue="characters" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="characters">Karakter</TabsTrigger>
                <TabsTrigger value="backgrounds">Background</TabsTrigger>
                <TabsTrigger value="art-styles">Gaya Seni</TabsTrigger>
                <TabsTrigger value="scenes">Adegan</TabsTrigger>
              </TabsList>
              <TabsContent value="characters">
                <CharacterList />
              </TabsContent>
              <TabsContent value="backgrounds">
                <BackgroundLibrary />
              </TabsContent>
              <TabsContent value="art-styles">
                <ArtStyleLibrary />
              </TabsContent>
              <TabsContent value="scenes">
                <SceneForm />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-6">
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? "Membuat Prompt..." : "Buat Prompt"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCopyPrompt} disabled={!generatedPrompt}>
                <Copy className="mr-2 h-4 w-4" />Copy Prompt
              </Button>
              <Button type="button" variant="outline" onClick={handleSavePrompt} disabled={!generatedPrompt}>
                <Save className="mr-2 h-4 w-4" />Save Prompt
              </Button>
            </div>
            <div className="border rounded-lg p-4 min-h-[200px]">
              <h3 className="text-lg font-medium mb-4">Hasil Prompt</h3>
              {generatedPrompt ? (
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">{generatedPrompt}</pre>
              ) : (
                <span className="text-muted-foreground">Prompt akan muncul di sini setelah Anda klik tombol Buat Prompt.</span>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
} 
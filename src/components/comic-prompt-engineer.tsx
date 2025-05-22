"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CharacterList } from "@/components/character-list";
import { SceneForm } from "@/components/scene-form";
import { BackgroundLibrary } from "@/components/background-library";
import { ArtStyleLibrary } from "@/components/art-style-library";
import { CharacterService } from "@/services/character-service";
import { BackgroundService } from "@/services/background-service";
import { Copy, Save } from "lucide-react";
import { ProjectInfoSection } from "@/components/project-info-section";
import { ProjectOutlineSection } from "@/components/project-outline-section";
import { PropertyLibrary } from "@/components/property-library";
import type { Character, Background } from '@/types/service';
import { defaultBackgroundOptions, timeOptions, atmosphereOptions, cameraAngleOptions } from "@/components/scene-form";
import { ArtStyleService } from "@/services/art-style-service";
import type { ArtStyle } from "@/types/service";

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
      const storedCharacters: Character[] = await CharacterService.getAllCharacters();
      const storedBackgrounds: Background[] = await BackgroundService.getAllBackgrounds();
      const storedArtStyles: ArtStyle[] = await ArtStyleService.getAllArtStyles();
      const scenes = data.scenes || [];
      const scene = scenes[0] || {};
      const sceneCharacters = scene.characters || [];

      // Get character details from storage
      const characterDetails = sceneCharacters.map((char: { 
        characterId: string;
        expression?: string;
        action?: string;
        interaction?: string;
        interactionTarget?: string;
        interactionBodyPart?: string;
        interaksiObjek?: string;
        interaksiProperties?: string[];
        dialog?: string;
      }) => {
        const character = storedCharacters.find((c) => c.id === char.characterId);
        return {
          name: character?.name || "Unknown Character",
          description: character?.description || "",
          physical: character && typeof character.physical === "string" ? character.physical : "",
          clothing: character && typeof character.clothing === "string" ? character.clothing : "",
          expression: char.expression || "",
          action: char.action || "",
          interaction: char.interaction || "",
          interactionTarget: storedCharacters.find((c) => c.id === (char.interactionTarget || ""))?.name || "",
          bodyPart: char.interactionBodyPart || "",
          interaksiObjek: char.interaksiObjek || "",
          interaksiProperties: Array.isArray(char.interaksiProperties) ? char.interaksiProperties : [],
        };
      });

      // Get background details from storage
      let backgroundLabel = "";
      const sceneRecord = scene as Record<string, unknown>;
      const backgroundValue = sceneRecord.background;
      const defaultBg = defaultBackgroundOptions.find((opt) => opt.value === backgroundValue);
      const libraryBg = storedBackgrounds.find((opt: { id: string; name: string }) => opt.id === backgroundValue);
      if (defaultBg) {
        backgroundLabel = defaultBg.label;
      } else if (libraryBg) {
        backgroundLabel = libraryBg.name;
      } else {
        backgroundLabel = typeof backgroundValue === "string" ? backgroundValue : "-";
      }

      // Build the prompt
      let prompt = "PROMPT KOMIK PANEL\n\n";
      prompt += "🧑‍🎤 KARAKTER UTAMA\n\n";
      characterDetails.forEach((char, idx) => {
        prompt += `Karakter #${idx + 1}\n`;
        prompt += `Nama/Identitas: ${char.name}\n`;
        prompt += `Deskripsi fisik: ${char.physical}\n`;
        prompt += `Pakaian: ${char.clothing}\n`;
        prompt += `Ekspresi wajah: ${char.expression || "-"}\n`;
        prompt += `Aksi saat ini: ${char.action || "-"}\n`;
        prompt += `Interaksi objek: ${char.interaksiObjek || "-"}\n`;
        prompt += `Property: ${(char.interaksiProperties && char.interaksiProperties.length > 0) ? char.interaksiProperties.join(", ") : "-"}\n`;
        // Format interaksi naratif
        if (char.interaction && char.interactionTarget) {
          prompt += `Interaksi: ${char.name} melakukan '${char.interaction}' pada ${char.interactionTarget} (bagian: ${char.bodyPart || "-"})\n`;
        } else {
          prompt += `Interaksi: -\n`;
        }
        prompt += `Dialog: ${(sceneCharacters[idx] && typeof sceneCharacters[idx].dialog === "string" && sceneCharacters[idx].dialog.trim() !== "") ? sceneCharacters[idx].dialog : "-"}\n`;
        if ((scene as Record<string, unknown>).gerakanTubuh) {
          prompt += `Gerakan tubuh: ${(scene as Record<string, unknown>).gerakanTubuh}\n`;
        }
        prompt += "\n";
      });

      // Add background section
      prompt += "🖼️ LATAR (BACKGROUND)\n\n";
      prompt += `Nama lokasi: ${backgroundLabel}\n`;
      prompt += `Detail visual: ${(scene as Record<string, unknown>).detailVisual || (libraryBg ? (libraryBg.description || "-") : "-")}\n`;
      prompt += `Detail latar: ${(scene as Record<string, unknown>).detailLatar || "-"}\n`;
      prompt += `Property di background: ${(scene as Record<string, unknown>).backgroundProperties ? (Array.isArray((scene as Record<string, unknown>).backgroundProperties) ? ((scene as Record<string, unknown>).backgroundProperties as string[]).join(", ") : "-") : "-"}\n`;
      // Waktu
      let waktuLabel = "-";
      const waktuOpt = timeOptions.find((opt: { value: string; label: string }) => opt.value === (scene as Record<string, unknown>).time);
      if (waktuOpt) waktuLabel = waktuOpt.label;
      prompt += `Waktu: ${waktuLabel}\n`;
      // Atmosfer
      let atmosferLabel = "-";
      const atmosferOpt = atmosphereOptions.find((opt: { value: string; label: string }) => opt.value === (scene as Record<string, unknown>).atmosphere);
      if (atmosferOpt) atmosferLabel = atmosferOpt.label;
      prompt += `Cuaca: ${atmosferLabel}\n`;
      prompt += `Pencahayaan detail: ${(scene as Record<string, unknown>).pencahayaanDetail || "-"}\n`;
      prompt += `Arah pencahayaan: ${(scene as Record<string, unknown>).arahPencahayaan || "-"}\n`;
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
      const latarOrangOpt = latarOrangOptions.find((opt: { value: string; label: string }) => opt.value === (scene as Record<string, unknown>).latarOrang);
      if (latarOrangOpt) latarOrangLabel = latarOrangOpt.label;
      prompt += `Orang sekitar: ${latarOrangLabel}\n`;

      // Add style section
      const styleValue = (scene as Record<string, unknown>).style;
      let styleSection = "";
      if (typeof styleValue === "string" && styleValue) {
        const foundStyle = storedArtStyles.find((s) => s.id === styleValue);
        if (foundStyle) {
          styleSection += `Gaya artistik (library): ${foundStyle.name}\n`;
          styleSection += `Deskripsi gaya: ${foundStyle.description || "-"}\n`;
          styleSection += `Karakteristik: ${(foundStyle.characteristics && foundStyle.characteristics.length > 0) ? foundStyle.characteristics.join(", ") : "-"}\n`;
          styleSection += `Contoh: ${(foundStyle.examples && foundStyle.examples.length > 0) ? foundStyle.examples.join(", ") : "-"}\n`;
        } else {
          styleSection += `Gaya artistik: ${styleValue}\n`;
        }
      } else {
        styleSection += `Gaya artistik: -\n`;
      }
      styleSection += `Custom style: ${(scene as Record<string, unknown>).styleCustom || "-"}\n`;
      styleSection += `Render quality: ${(scene as Record<string, unknown>).renderQuality || "-"}\n`;
      styleSection += `Detail tekstur: ${(scene as Record<string, unknown>).detailTekstur || "-"}\n`;
      styleSection += `Detail warna: ${(scene as Record<string, unknown>).detailWarna || "-"}\n`;
      styleSection += `Detail gaya: ${(scene as Record<string, unknown>).detailGaya || "-"}\n`;
      prompt += styleSection;

      // Add camera and panel section
      prompt += "📷 KAMERA & PANEL\n\n";
      prompt += `Jenis panel: ${(scene as Record<string, unknown>).jenisPanel || "-"}\n`;
      prompt += `Ukuran panel: ${(scene as Record<string, unknown>).ukuranPanel || "-"}\n`;
      prompt += `Rasio panel: ${(scene as Record<string, unknown>).rasioPanel || "-"}\n`;
      prompt += `Orientasi: ${(scene as Record<string, unknown>).orientasiPanel || "-"}\n`;
      const cameraLabel = cameraAngleOptions.find((opt: { value: string; label: string }) => opt.value === (scene as Record<string, unknown>).cameraAngle)?.label || "-";
      prompt += `Sudut kamera: ${cameraLabel}\n`;
      prompt += `Komposisi visual: ${(scene as Record<string, unknown>).komposisiVisual || "-"}\n`;
      prompt += `Komposisi karakter: ${(scene as Record<string, unknown>).komposisiKarakter || "-"}\n`;
      prompt += `Fokus kamera: ${(scene as Record<string, unknown>).fokusKamera || "-"}\n`;
      prompt += `Efek motion blur: ${(scene as Record<string, unknown>).efekMotionBlur || "-"}\n`;
      prompt += `Efek depth: ${(scene as Record<string, unknown>).efekDepth || "-"}\n`;

      // Add FX section
      prompt += "✨ EFEK (FX)\n\n";
      prompt += `Visual FX (VFX): ${(scene as Record<string, unknown>).vfx || "-"}\n`;
      prompt += `Detail VFX: ${(scene as Record<string, unknown>).detailVFX || "-"}\n`;
      prompt += `Motion FX: ${(scene as Record<string, unknown>).motionFX || "-"}\n`;
      prompt += `Detail Motion FX: ${(scene as Record<string, unknown>).detailMotionFX || "-"}\n`;
      let soundFXLabel = "-";
      const soundFXScene = sceneRecord.soundFXScene;
      const soundFXSceneCustom = sceneRecord.soundFXSceneCustom;
      if (soundFXScene === "custom" && typeof soundFXSceneCustom === "string") {
        soundFXLabel = soundFXSceneCustom;
      } else if (typeof soundFXScene === "string" && soundFXScene !== "none") {
        soundFXLabel = soundFXScene;
      }
      prompt += `Sound FX: ${soundFXLabel}\n`;
      prompt += `Detail Sound FX: ${(scene as Record<string, unknown>).detailSoundFX || "-"}\n`;
      prompt += `Efek suara custom: ${(scene as Record<string, unknown>).efekSuaraCustom || "-"}\n`;

      // Add render quality instruction at the end
      const renderQuality = (scene as Record<string, unknown>).renderQuality;
      if (renderQuality) {
        prompt += "\nINSTRUKSI RENDER:\n";
        switch (renderQuality) {
          case "artistic":
            prompt += "Buat gambar dengan pendekatan artistik yang kuat. Fokus pada:\n" +
                     "1. Detail yang kaya dan kompleks dalam setiap elemen\n" +
                     "2. Komposisi yang menonjolkan nilai estetika dan keseimbangan visual\n" +
                     "3. Penggunaan warna yang ekspresif dan harmonis\n" +
                     "4. Tekstur yang terasa dan dimensi yang dalam\n" +
                     "5. Pencahayaan yang dramatis untuk menciptakan suasana yang kuat";
            break;
          case "realistic":
            prompt += "Buat gambar dengan detail fotorealistik yang menakjubkan. Perhatikan:\n" +
                     "1. Detail mikroskopis pada setiap permukaan dan tekstur\n" +
                     "2. Pencahayaan natural dengan bayangan yang akurat\n" +
                     "3. Gradasi warna yang halus dan natural\n" +
                     "4. Refleksi dan transparansi yang realistis\n" +
                     "5. Kedalaman bidang yang terasa melalui perspektif yang tepat";
            break;
          case "stylized":
            prompt += "Buat gambar dengan gaya yang unik dan khas. Tekankan:\n" +
                     "1. Elemen desain yang berani dan tidak konvensional\n" +
                     "2. Interpretasi kreatif dari bentuk dan warna\n" +
                     "3. Distorsi proporsi yang disengaja untuk efek visual\n" +
                     "4. Penggunaan warna yang tidak natural tapi harmonis\n" +
                     "5. Tekstur dan pola yang unik dan mencolok";
            break;
          case "cartoon":
            prompt += "Buat gambar dengan gaya kartun yang ceria dan menarik. Fokus pada:\n" +
                     "1. Garis yang jelas, tebal, dan konsisten\n" +
                     "2. Warna-warna yang hidup dan cerah\n" +
                     "3. Ekspresi wajah yang berlebihan dan ekspresif\n" +
                     "4. Proporsi yang dinamis dan menarik\n" +
                     "5. Bayangan dan highlight yang sederhana tapi efektif";
            break;
          case "sketch":
            prompt += "Buat gambar dengan gaya sketsa yang ekspresif. Perhatikan:\n" +
                     "1. Goresan tangan yang terlihat dan dinamis\n" +
                     "2. Detail yang minimalis tapi esensial\n" +
                     "3. Tekstur kertas yang terasa\n" +
                     "4. Bayangan yang dibuat dengan garis atau cross-hatching\n" +
                     "5. Kesederhanaan yang tetap mempertahankan karakter";
            break;
          case "painterly":
            prompt += "Buat gambar dengan gaya lukisan tradisional. Tekankan:\n" +
                     "1. Sapuan kuas yang terlihat dan ekspresif\n" +
                     "2. Tekstur cat yang kaya dan berlapis\n" +
                     "3. Blending warna yang halus dan natural\n" +
                     "4. Dimensi yang tercipta melalui teknik impasto\n" +
                     "5. Karakteristik media cat yang terasa";
            break;
          case "anime":
            prompt += "Buat gambar dengan gaya anime Jepang yang khas. Fokus pada:\n" +
                     "1. Proporsi karakter yang dinamis dan menarik\n" +
                     "2. Ekspresi wajah yang kuat dan emosional\n" +
                     "3. Garis yang bersih dan konsisten\n" +
                     "4. Warna yang cerah dan kontras yang kuat\n" +
                     "5. Efek khusus yang khas anime (speed lines, impact frames)";
            break;
          case "pixel":
            prompt += "Buat gambar dengan gaya pixel art yang retro. Perhatikan:\n" +
                     "1. Grid pixel yang jelas dan konsisten\n" +
                     "2. Palet warna yang terbatas tapi efektif\n" +
                     "3. Dithering untuk gradasi warna\n" +
                     "4. Silhouette yang mudah dikenali\n" +
                     "5. Detail yang disederhanakan tapi tetap informatif";
            break;
          case "watercolor":
            prompt += "Buat gambar dengan gaya cat air yang lembut. Tekankan:\n" +
                     "1. Transparansi dan efek bleeding yang khas\n" +
                     "2. Gradasi warna yang halus dan natural\n" +
                     "3. Tekstur kertas yang terlihat\n" +
                     "4. Sapuan kuas yang lembut dan mengalir\n" +
                     "5. Efek serendipity dalam pencampuran warna";
            break;
          case "3d":
            prompt += "Buat gambar dengan tampilan 3D yang realistis. Fokus pada:\n" +
                     "1. Dimensi dan perspektif yang akurat\n" +
                     "2. Bayangan dan pencahayaan yang realistis\n" +
                     "3. Tekstur permukaan yang detail\n" +
                     "4. Refleksi dan transparansi yang natural\n" +
                     "5. Depth of field yang tepat";
            break;
          case "simple":
            prompt += "Buat gambar dengan gaya sederhana yang efektif. Perhatikan:\n" +
                     "1. Garis yang bersih dan minimalis\n" +
                     "2. Warna yang flat dan tidak terlalu kompleks\n" +
                     "3. Komposisi yang jelas dan mudah dibaca\n" +
                     "4. Detail yang esensial saja\n" +
                     "5. Bayangan yang sederhana tapi efektif";
            break;
          default:
            prompt += `Buat gambar dengan gaya ${renderQuality}, pastikan untuk menekankan karakteristik unik dari gaya tersebut.`;
        }
      }

      setGeneratedPrompt(prompt);
      setIsGenerating(false);
    } catch (e) {
      setIsGenerating(false);
      showToast({
        title: "Gagal Membuat Prompt",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive"
      });
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
        <div className="flex gap-8 items-start">
          {/* Sidebar kiri */}
          <div className="w-[350px] space-y-4">
            <section className="bg-white border rounded-lg shadow-sm">
              <div className="px-4 pt-4 pb-2 font-bold text-lg bg-gray-100 rounded-t-lg">Project Info</div>
              <div className="p-4 pt-0">
                <ProjectInfoSection />
              </div>
            </section>
            <section className="bg-white border rounded-lg shadow-sm">
              <div className="px-4 pt-4 pb-2 font-bold text-lg bg-gray-100 rounded-t-lg">Struktur Project / Alur Cerita</div>
              <div className="p-4 pt-0">
                <ProjectOutlineSection />
              </div>
            </section>
            <section className="bg-white border rounded-lg shadow-sm">
              <div className="px-4 pt-4 pb-2 font-bold text-lg bg-gray-100 rounded-t-lg">Karakter</div>
              <div className="p-4 pt-0">
                <CharacterList />
              </div>
            </section>
            <section className="bg-white border rounded-lg shadow-sm">
              <div className="px-4 pt-4 pb-2 font-bold text-lg bg-gray-100 rounded-t-lg">Background</div>
              <div className="p-4 pt-0">
                <BackgroundLibrary />
              </div>
            </section>
            <section className="bg-white border rounded-lg shadow-sm">
              <div className="px-4 pt-4 pb-2 font-bold text-lg bg-gray-100 rounded-t-lg">Gaya Seni</div>
              <div className="p-4 pt-0">
                <ArtStyleLibrary />
              </div>
            </section>
            <section className="bg-white border rounded-lg shadow-sm">
              <div className="px-4 pt-4 pb-2 font-bold text-lg bg-gray-100 rounded-t-lg">Property / Object</div>
              <div className="p-4 pt-0">
                <PropertyLibrary />
              </div>
            </section>
          </div>
          {/* Main section kanan */}
          <div className="flex-1 space-y-4">
            <section className="bg-white border rounded-lg shadow-sm">
              <h2 className="text-xl font-bold bg-gray-200 px-4 py-2 rounded-t-lg">Adegan</h2>
              <div className="p-4">
                <SceneForm />
              </div>
            </section>
            <section className="bg-white border rounded-lg shadow-sm">
              <div className="p-4">
                <div className="flex justify-end gap-2 mb-4">
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
            </section>
          </div>
        </div>
      </form>
    </FormProvider>
  );
} 
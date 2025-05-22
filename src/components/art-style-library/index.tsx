"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, Pencil, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { ArtStyleService } from "@/services/art-style-service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ArtStyle } from "@/types/service";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  characteristics: z.array(z.string()).min(1, "Minimal satu karakteristik"),
  examples: z.array(z.string()).min(1, "Minimal satu contoh"),
});

type FormValues = z.infer<typeof formSchema>;

export function ArtStyleLibrary() {
  const [artStyles, setArtStyles] = useState<ArtStyle[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoData, setInfoData] = useState<null | {name: string, description: string, characteristics: string[], examples: string[] }>(null);
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      characteristics: [""],
      examples: [""],
    }
  });

  const loadArtStyles = useCallback(async () => {
    try {
      const styles = await ArtStyleService.getAllArtStyles();
      setArtStyles(styles);
    } catch {
      showToast({
        title: "Error",
        description: "Gagal memuat daftar gaya seni",
        variant: "destructive"
      });
    }
  }, [showToast]);

  useEffect(() => {
    loadArtStyles();
  }, [loadArtStyles]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);
      if (editId) {
        await ArtStyleService.updateArtStyle(editId, {
          name: data.name,
          description: data.description,
          characteristics: data.characteristics,
          examples: data.examples
        });
      } else {
        await ArtStyleService.saveArtStyle({
          name: data.name,
          description: data.description,
          characteristics: data.characteristics,
          examples: data.examples
        });
      }
      showToast({
        title: "Sukses",
        description: editId ? "Gaya seni berhasil diupdate!" : "Gaya seni berhasil disimpan!",
      });
      form.reset();
      setShowForm(false);
      setEditId(null);
      const styles = await ArtStyleService.getAllArtStyles();
      setArtStyles(styles);
    } catch {
      showToast({
        title: "Error",
        description: editId ? "Gagal update gaya seni" : "Gagal menyimpan gaya seni",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteArtStyle = async (id: string) => {
    try {
      await ArtStyleService.deleteArtStyle(id);
      showToast({
        title: "Sukses",
        description: "Gaya seni berhasil dihapus!",
      });
      const styles = await ArtStyleService.getAllArtStyles();
      setArtStyles(styles);
    } catch {
      showToast({
        title: "Error",
        description: "Gagal menghapus gaya seni",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (artStyle: ArtStyle) => {
    form.reset({
      name: artStyle.name,
      description: artStyle.description,
      characteristics: artStyle.characteristics,
      examples: artStyle.examples,
    });
    setEditId(artStyle.id);
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
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Gaya Seni
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
                  <FormLabel>Nama Gaya Seni</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama gaya seni" {...field} />
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
                      placeholder="Masukkan deskripsi gaya seni"
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
              name="characteristics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Karakteristik</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((_, index) => (
                        <Input
                          key={index}
                          placeholder="Masukkan karakteristik"
                          value={field.value[index]}
                          onChange={(e) => {
                            const newValue = [...field.value];
                            newValue[index] = e.target.value;
                            field.onChange(newValue);
                          }}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange([...field.value, ""])}
                      >
                        Tambah Karakteristik
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="examples"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contoh</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((_, index) => (
                        <Input
                          key={index}
                          placeholder="Masukkan contoh"
                          value={field.value[index]}
                          onChange={(e) => {
                            const newValue = [...field.value];
                            newValue[index] = e.target.value;
                            field.onChange(newValue);
                          }}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange([...field.value, ""])}
                      >
                        Tambah Contoh
                      </Button>
                    </div>
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
                {isSaving ? "Menyimpan..." : (editId ? "Simpan Perubahan" : "Simpan Gaya Seni")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {artStyles.map((artStyle) => (
          <Card key={artStyle.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{artStyle.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(artStyle)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteArtStyle(artStyle.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInfoData({
                      name: artStyle.name,
                      description: artStyle.description,
                      characteristics: artStyle.characteristics,
                      examples: artStyle.examples
                    });
                    setInfoOpen(true);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoData?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Deskripsi</h4>
              <p className="text-sm text-muted-foreground">{infoData?.description}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Karakteristik</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {infoData?.characteristics?.map((char, idx) => (
                  <li key={idx}>{char}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contoh</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {infoData?.examples?.map((ex, idx) => (
                  <li key={idx}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ArtStyleList() {
  const [artStyles, setArtStyles] = useState<ArtStyle[]>([]);
  useEffect(() => {
    ArtStyleService.getAllArtStyles().then(setArtStyles);
  }, []);
  return (
    <div className="space-y-4 mt-4">
      {artStyles.map((style) => (
        <Card key={style.id} className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{style.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{style.description}</p>
            <div className="space-y-2">
              <div>
                <h5 className="text-sm font-medium">Karakteristik:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {style.characteristics.map((char: string, index: number) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium">Contoh:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {style.examples.map((example: string, index: number) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, Save, Pencil, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { ArtStyleService } from "@/services/art-style-service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  characteristics: z.array(z.string()).min(1, "Karakteristik harus diisi"),
  examples: z.array(z.string()).min(1, "Contoh harus diisi")
});

type FormValues = z.infer<typeof formSchema>;

export function ArtStyleLibrary() {
  const [artStyles, setArtStyles] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoData, setInfoData] = useState<null | {name: string, description: string, characteristics: string[], examples: string[] }>(null);
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      characteristics: [],
      examples: []
    }
  });

  useEffect(() => {
    loadArtStyles();
  }, []);

  const loadArtStyles = async () => {
    try {
      const data = await ArtStyleService.getAllArtStyles();
      setArtStyles(data);
    } catch (error) {
      console.error("Error loading art styles:", error);
      showToast({
        title: "Error",
        description: "Gagal memuat gaya seni",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);
      if (editId) {
        await ArtStyleService.updateArtStyle(editId, data);
      } else {
        await ArtStyleService.saveArtStyle(data);
      }
      showToast({
        title: "Sukses",
        description: editId ? "Gaya seni berhasil diupdate!" : "Gaya seni berhasil disimpan!",
      });
      form.reset();
      setShowForm(false);
      setEditId(null);
      setModalOpen(false);
      loadArtStyles();
    } catch (error) {
      showToast({
        title: "Error",
        description: editId ? "Gagal update gaya seni" : "Gagal menyimpan gaya seni",
        variant: "destructive",
      });
      console.error("Error saving art style:", error);
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
      loadArtStyles();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menghapus gaya seni",
        variant: "destructive",
      });
      console.error("Error deleting art style:", error);
    }
  };

  const handleEdit = (style: any) => {
    form.reset({
      name: style.name,
      description: style.description,
      characteristics: style.characteristics,
      examples: style.examples,
    });
    setEditId(style.id);
    setShowForm(true);
    setModalOpen(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setModalOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Library Gaya Seni</h3>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(true); setEditId(null); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Gaya Seni
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Gaya Seni" : "Tambah Gaya Seni"}</DialogTitle>
            </DialogHeader>
            {showForm && (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Gaya</FormLabel>
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
                        <Textarea
                          placeholder="Masukkan karakteristik gaya seni (satu per baris)"
                          className="min-h-[100px]"
                          value={field.value.join("\n")}
                          onChange={(e) => field.onChange(e.target.value.split("\n").filter(Boolean))}
                        />
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
                        <Textarea
                          placeholder="Masukkan contoh gaya seni (satu per baris)"
                          className="min-h-[100px]"
                          value={field.value.join("\n")}
                          onChange={(e) => field.onChange(e.target.value.split("\n").filter(Boolean))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel}>Batal</Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? (editId ? "Menyimpan..." : "Menyimpan...") : (editId ? "Update Gaya Seni" : "Simpan Gaya Seni")}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoData?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-muted-foreground whitespace-pre-line">{infoData?.description}</div>
            {infoData?.characteristics && infoData.characteristics.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mt-2">Karakteristik:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {infoData.characteristics.map((char, idx) => (
                    <li key={idx}>{char}</li>
                  ))}
                </ul>
              </div>
            )}
            {infoData?.examples && infoData.examples.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mt-2">Contoh:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {infoData.examples.map((ex, idx) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 gap-4">
        {artStyles.map((style) => (
          <Card key={style.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium mb-1">{style.name}</h4>
                <p className="text-sm text-muted-foreground">{style.description}</p>
              </div>
              <div className="flex gap-1 items-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setInfoData({ name: style.name, description: style.description, characteristics: style.characteristics, examples: style.examples }); setInfoOpen(true); }}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(style)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteArtStyle(style.id)}
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

export function ArtStyleList() {
  const [artStyles, setArtStyles] = useState<any[]>([]);
  useEffect(() => {
    ArtStyleService.getAllArtStyles().then(setArtStyles);
  }, []);
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
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
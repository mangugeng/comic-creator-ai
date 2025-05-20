"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, Info, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { BackgroundService } from "@/services/background-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi")
});

type FormValues = z.infer<typeof formSchema>;

type Background = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export function BackgroundLibrary() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  useEffect(() => {
    loadBackgrounds();
  }, []);

  const loadBackgrounds = async () => {
    try {
      const data = await BackgroundService.getAllBackgrounds();
      setBackgrounds(data);
    } catch (error) {
      console.error("Error loading backgrounds:", error);
      showToast({
        title: "Error",
        description: "Gagal memuat background",
        variant: "destructive",
      });
    }
  };

  const onAddClick = () => {
    setShowAddForm(true);
    form.reset();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);
      await BackgroundService.saveBackground({
        name: data.name,
        description: data.description
      });
      showToast({
        title: "Sukses",
        description: "Background berhasil disimpan!",
      });
      form.reset();
      setShowAddForm(false);
      loadBackgrounds();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menyimpan background",
        variant: "destructive",
      });
      console.error("Error saving background:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const onEdit = (background: Background) => {
    setSelectedBackground(background);
    setShowEditDialog(true);
    form.reset({ name: background.name, description: background.description });
  };

  const onUpdate = async (data: FormValues) => {
    if (!selectedBackground) return;
    try {
      setIsSaving(true);
      await BackgroundService.updateBackground(selectedBackground.id, {
        name: data.name,
        description: data.description,
        updatedAt: new Date().toISOString()
      });
      showToast({
        title: "Sukses",
        description: "Background berhasil diperbarui!",
      });
      setShowEditDialog(false);
      setSelectedBackground(null);
      loadBackgrounds();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal memperbarui background",
        variant: "destructive",
      });
      console.error("Error updating background:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBackground = async (id: string) => {
    try {
      await BackgroundService.deleteBackground(id);
      showToast({
        title: "Sukses",
        description: "Background berhasil dihapus!",
      });
      loadBackgrounds();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menghapus background",
        variant: "destructive",
      });
      console.error("Error deleting background:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Background</h3>
        <Button onClick={onAddClick} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Background
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
                  <FormLabel>Nama Background</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama background" {...field} />
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
                      placeholder="Masukkan deskripsi background"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                  await onSubmit(values);
                }}
              >
                {isSaving ? "Menyimpan..." : "Simpan Background"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {backgrounds.map((background) => (
          <Card key={background.id} className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{background.name}</span>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{background.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Deskripsi</h4>
                        <p className="text-sm text-muted-foreground">{background.description}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(background)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteBackground(background.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Background</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Background</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  const values = form.getValues();
                  await onUpdate(values);
                }}
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
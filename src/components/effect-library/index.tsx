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
import { EffectService } from "@/services/effect-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  type: z.enum(["visual", "sound"]),
  description: z.string().min(1, "Deskripsi harus diisi")
});

type FormValues = z.infer<typeof formSchema>;

const effectTypeOptions = [
  { value: "visual", label: "Visual Effect" },
  { value: "sound", label: "Sound Effect" }
];

export function EffectLibrary() {
  const [effects, setEffects] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "visual",
      description: ""
    }
  });

  useEffect(() => {
    loadEffects();
  }, []);

  const loadEffects = async () => {
    try {
      const data = await EffectService.getAllEffects();
      setEffects(data);
    } catch (error) {
      console.error("Error loading effects:", error);
      showToast({
        title: "Error",
        description: "Gagal memuat efek",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);
      await EffectService.saveEffect(data);
      showToast({
        title: "Sukses",
        description: "Efek berhasil disimpan!",
      });
      form.reset();
      loadEffects();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menyimpan efek",
        variant: "destructive",
      });
      console.error("Error saving effect:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEffect = async (id: string) => {
    try {
      await EffectService.deleteEffect(id);
      showToast({
        title: "Sukses",
        description: "Efek berhasil dihapus!",
      });
      loadEffects();
    } catch (error) {
      showToast({
        title: "Error",
        description: "Gagal menghapus efek",
        variant: "destructive",
      });
      console.error("Error deleting effect:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Library Efek</h3>
      </div>

      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Efek</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama efek" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Efek</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis efek" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {effectTypeOptions.map((option) => (
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan deskripsi efek"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Menyimpan..." : "Simpan Efek"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {effects.map((effect) => (
          <Card key={effect.id} className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{effect.name}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEffect(effect.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{effect.description}</p>
              <Badge variant="outline">
                {effectTypeOptions.find(opt => opt.value === effect.type)?.label}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Character } from "@/types/character";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  physical: z.string().min(1, "Deskripsi fisik harus diisi"),
  clothing: z.string().optional(),
  isBackground: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export interface CharacterFormProps {
  character?: Character | null;
  onSave: (data: Omit<Character, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export function CharacterForm({ character, onSave, onCancel }: CharacterFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver<FormValues, any, FormValues>(formSchema as z.ZodType<FormValues>),
    defaultValues: {
      name: character?.name || "",
      physical: character?.physical || "",
      clothing: character?.clothing || "",
      isBackground: character?.isBackground || false,
    },
  });

  const onSubmit = (values: FormValues) => {
    onSave({
      name: values.name,
      physical: values.physical,
      clothing: values.clothing,
      isBackground: values.isBackground,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama karakter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="physical"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Fisik</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Masukkan deskripsi fisik karakter"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clothing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pakaian</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan deskripsi pakaian" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isBackground"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Karakter Latar</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {character ? "Simpan Perubahan" : "Tambah Karakter"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 
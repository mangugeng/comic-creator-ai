"use client";

import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Opsi untuk dropdown
const timeOfDayOptions = [
  { value: "pagi", label: "Pagi" },
  { value: "siang", label: "Siang" },
  { value: "sore", label: "Sore" },
  { value: "malam", label: "Malam" },
  { value: "dini-hari", label: "Dini Hari" },
  { value: "fajar", label: "Fajar" },
  { value: "senja", label: "Senja" },
];

const weatherOptions = [
  { value: "cerah", label: "Cerah" },
  { value: "berawan", label: "Berawan" },
  { value: "hujan-ringan", label: "Hujan Ringan" },
  { value: "hujan-deras", label: "Hujan Deras" },
  { value: "badai", label: "Badai" },
  { value: "berkabut", label: "Berkabut" },
  { value: "bersalju", label: "Bersalju" },
  { value: "panas", label: "Panas/Terik" },
];

const backgroundCharacterOptions = [
  { value: "keramaian", label: "Keramaian (Crowd)" },
  { value: "rombongan", label: "Rombongan" },
  { value: "kelompok-kecil", label: "Kelompok Kecil" },
  { value: "pasangan", label: "Pasangan" },
  { value: "keluarga", label: "Keluarga" },
  { value: "teman", label: "Teman" },
  { value: "penonton", label: "Penonton" },
  { value: "pengunjung", label: "Pengunjung" },
  { value: "pekerja", label: "Pekerja" },
  { value: "siswa", label: "Siswa" },
];

export function BackgroundForm() {
  // Gunakan useFormContext untuk mengakses context form dari parent
  const form = useFormContext();
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lokasi</FormLabel>
            <FormControl>
              <Input
                placeholder="Jalan kota, ruang kelas, hutan berkabut"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="timeOfDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waktu</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOfDayOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="weather"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuaca / Atmosfer</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cuaca" />
                  </SelectTrigger>
                  <SelectContent>
                    {weatherOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="backgroundDetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Detail Tambahan</FormLabel>
            <FormControl>
              <Input
                placeholder="Lampu neon, mobil terbakar, papan tulis"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="backgroundCharacters"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Karakter Latar</FormLabel>
            <FormControl>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis karakter latar" />
                </SelectTrigger>
                <SelectContent>
                  {backgroundCharacterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
} 
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Save, X } from "lucide-react";

export function ProjectInfoSection() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creator, setCreator] = useState("");
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("projectInfo");
    if (data) {
      const parsed = JSON.parse(data);
      setName(parsed.name || "");
      setDescription(parsed.description || "");
      setCreator(parsed.creator || "");
      setHasData(!!parsed.name || !!parsed.description || !!parsed.creator);
      setEditMode(false);
    }
  }, [saved]);

  const handleSave = () => {
    localStorage.setItem(
      "projectInfo",
      JSON.stringify({ name, description, creator })
    );
    setSaved(true);
    setEditMode(false);
    setHasData(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleDelete = () => {
    localStorage.removeItem("projectInfo");
    setName("");
    setDescription("");
    setCreator("");
    setHasData(false);
    setEditMode(true);
  };

  return (
    hasData && !editMode ? (
      <div className="flex justify-between items-center gap-2">
        <div>
          <div className="font-semibold text-base">{name}</div>
          <div className="text-sm text-muted-foreground whitespace-pre-line">{description}</div>
          <div className="text-xs text-muted-foreground">Creator: {creator}</div>
        </div>
        <div className="flex flex-col gap-2">
          <Button size="icon" variant="outline" onClick={handleEdit}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="destructive" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Nama Project"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Textarea
          placeholder="Deskripsi Project"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <Input
          placeholder="Creator"
          value={creator}
          onChange={e => setCreator(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button onClick={handleSave} size="icon" variant="outline"><Save className="h-4 w-4" /></Button>
          <Button type="button" onClick={() => setEditMode(false)} size="icon" variant="ghost"><X className="h-4 w-4" /></Button>
        </div>
        {saved && <div className="text-green-600 text-xs mt-2">Tersimpan!</div>}
      </div>
    )
  );
} 
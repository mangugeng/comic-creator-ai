import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Save, X, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type Property = {
  id: string;
  name: string;
  description: string;
  year: string;
  special: string;
};

export function PropertyLibrary() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [input, setInput] = useState({ id: "", name: "", description: "", year: "", special: "" });
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState({ id: "", name: "", description: "", year: "", special: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [infoIdx, setInfoIdx] = useState<number | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("propertyLibrary");
    if (data) setProperties(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("propertyLibrary", JSON.stringify(properties));
    if (properties.length > 0) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1000);
    }
  }, [properties]);

  const handleAdd = () => {
    if (input.name.trim()) {
      setProperties([
        ...properties,
        { ...input, id: crypto.randomUUID() }
      ]);
      setInput({ id: "", name: "", description: "", year: "", special: "" });
      setShowAddForm(false);
    }
  };

  const handleRemove = (idx: number) => {
    setProperties(properties.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(properties[idx]);
  };

  const handleEditSave = () => {
    if (editIdx !== null && editValue.name.trim()) {
      const newProps = properties.slice();
      newProps[editIdx] = { ...editValue };
      setProperties(newProps);
      setEditIdx(null);
      setEditValue({ id: "", name: "", description: "", year: "", special: "" });
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditValue({ id: "", name: "", description: "", year: "", special: "" });
  };

  return (
    <div>
      <div className="flex justify-start items-center mb-2">
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(v => !v)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Property
        </Button>
      </div>
      {showAddForm && (
        <div className="flex flex-col gap-2 mb-2">
          <Input
            placeholder="Nama Property"
            value={input.name}
            onChange={e => setInput({ ...input, name: e.target.value })}
            autoFocus
          />
          <Textarea
            placeholder="Deskripsi"
            value={input.description}
            onChange={e => setInput({ ...input, description: e.target.value })}
          />
          <Input
            placeholder="Tahun Pembuatan"
            value={input.year}
            onChange={e => setInput({ ...input, year: e.target.value })}
          />
          <Input
            placeholder="Ciri Khusus"
            value={input.special}
            onChange={e => setInput({ ...input, special: e.target.value })}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={handleAdd} variant="outline" size="icon"><Save className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setShowAddForm(false); setInput({ id: "", name: "", description: "", year: "", special: "" }); }}><X className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
      <ul className="space-y-2 mb-2">
        {properties.map((item, idx) => (
          <li key={item.id} className="flex justify-between items-center bg-muted rounded px-2 py-1">
            {editIdx === idx ? (
              <>
                <div className="flex-1 flex flex-col gap-1 mr-2">
                  <Input
                    placeholder="Nama Property"
                    value={editValue.name}
                    onChange={e => setEditValue({ ...editValue, name: e.target.value })}
                    autoFocus
                  />
                  <Textarea
                    placeholder="Deskripsi"
                    value={editValue.description}
                    onChange={e => setEditValue({ ...editValue, description: e.target.value })}
                  />
                  <Input
                    placeholder="Tahun Pembuatan"
                    value={editValue.year}
                    onChange={e => setEditValue({ ...editValue, year: e.target.value })}
                  />
                  <Input
                    placeholder="Ciri Khusus"
                    value={editValue.special}
                    onChange={e => setEditValue({ ...editValue, special: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={handleEditSave}><Save className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={handleEditCancel}><X className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <>
                <span className="flex-1 font-medium">{item.name}</span>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={() => setInfoIdx(idx)}><Info className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    {infoIdx === idx && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{item.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold">Deskripsi:</span>
                            <div className="text-sm text-muted-foreground whitespace-pre-line">{item.description || '-'}</div>
                          </div>
                          <div>
                            <span className="font-semibold">Tahun Pembuatan:</span> {item.year || '-'}
                          </div>
                          <div>
                            <span className="font-semibold">Ciri Khusus:</span> {item.special || '-'}
                          </div>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(idx)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleRemove(idx)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {saved && <div className="text-green-600 text-xs">Tersimpan!</div>}
    </div>
  );
} 
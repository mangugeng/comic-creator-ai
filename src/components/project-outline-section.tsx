import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Save, X } from "lucide-react";

export function ProjectOutlineSection() {
  const [outlines, setOutlines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("projectOutline");
    if (data) {
      setOutlines(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("projectOutline", JSON.stringify(outlines));
    if (outlines.length > 0) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1000);
    }
  }, [outlines]);

  const handleAdd = () => {
    if (input.trim()) {
      setOutlines([...outlines, input.trim()]);
      setInput("");
      setShowAddForm(false);
    }
  };

  const handleRemove = (idx: number) => {
    setOutlines(outlines.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(outlines[idx]);
  };

  const handleEditSave = () => {
    if (editIdx !== null && editValue.trim()) {
      const newOutlines = outlines.slice();
      newOutlines[editIdx] = editValue.trim();
      setOutlines(newOutlines);
      setEditIdx(null);
      setEditValue("");
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditValue("");
  };

  return (
    <>
      <div className="flex justify-start items-center mb-2">
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(v => !v)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Alur
        </Button>
      </div>
      {showAddForm && (
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Tambah outline/alur cerita"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            autoFocus
          />
          <Button onClick={handleAdd} variant="outline" size="icon"><Save className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { setShowAddForm(false); setInput(""); }}><X className="h-4 w-4" /></Button>
        </div>
      )}
      <ul className="space-y-2 mb-2">
        {outlines.map((item, idx) => (
          <li key={idx} className="flex justify-between items-center bg-muted rounded px-2 py-1">
            {editIdx === idx ? (
              <>
                <Input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="flex-1 mr-2"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleEditSave(); } }}
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={handleEditSave}><Save className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={handleEditCancel}><X className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <>
                <span className="flex-1 font-medium">{item}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(idx)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleRemove(idx)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {saved && <div className="text-green-600 text-xs">Tersimpan!</div>}
    </>
  );
} 
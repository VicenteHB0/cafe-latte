"use client";

import { useState, useEffect } from 'react';
import { Plus, X, Tag, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CategoryManager({ open, onOpenChange }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        setError('Error al cargar categorías');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (res.ok) {
        const newCategory = await res.json();
        setCategories([...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        setNewCategoryName('');
        toast.success("Categoría añadida", { description: `${newCategory.name} ha sido creada.` });
      } else {
        const data = await res.json();
        toast.error("Error", { description: data.error || "No se pudo crear la categoría." });
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteClick = (cat) => {
    setCategoryToDelete(cat);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setError(null); // Clear previous errors
    
    try {
      const res = await fetch(`/api/categories?id=${categoryToDelete._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCategories(categories.filter(c => c._id !== categoryToDelete._id));
        toast.success("Categoría eliminada", { description: `${categoryToDelete.name} ha sido eliminada.` });
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } else {
        const data = await res.json();
        setError(data.error || "No se pudo eliminar la categoría.");
        toast.error("Error al eliminar", { description: "Revisa los mensajes del sistema." });
        setIsDeleteDialogOpen(false);
      }
    } catch (err) {
      toast.error("Error de conexión");
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-[#402E24] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#A67C52]" />
            Gestionar Categorías
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Añade nuevas categorías o elimina las existentes. Las categorías en uso no pueden eliminarse.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-4">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <Input 
              placeholder="Nueva categoría..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50 flex-1"
            />
            <Button type="submit" className="bg-[#402E24] hover:bg-[#2b1f18] text-white shrink-0">
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          </form>

          {/* Error Message Display */}
          {error && (
            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-xs ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Category List */}
          <ScrollArea className="h-[300px] border border-gray-100 rounded-xl bg-gray-50/50 p-4">
            {loading ? (
              <div className="text-center text-sm text-gray-400 py-10">Cargando categorías...</div>
            ) : categories.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-10">No hay categorías. Crea la primera.</div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm group">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(cat)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar categoría"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100">
             <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full border-gray-200 text-gray-600 hover:bg-gray-100">
               Cerrar
             </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      {/* Alert Dialog para Eliminar Categoría */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-none shadow-2xl z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#402E24] text-xl">¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 text-gray-600 hover:text-[#402E24] hover:bg-gray-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700 text-white shadow-md border-none">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

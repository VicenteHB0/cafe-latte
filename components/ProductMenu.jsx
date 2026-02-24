"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft } from 'lucide-react';
// import { mockProducts } from '../data/mockProducts'; // Deprecated in favor of DB
import { ProductCard } from './ProductCard';
import { AddProductCard } from './AddProductCard';
import { ProductFormDialog } from './ProductFormDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Settings } from 'lucide-react';
import { CategoryManager } from './CategoryManager';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ProductSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}

export function ProductMenu() {
  const router = useRouter();
  const onBack = () => router.push('/menu');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, unavailable
  const [loading, setLoading] = useState(true);

  // Estados para diálogos
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setDbCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener categorías directamente de la DB, usar un fallback si está vacío
  const dynamicCategories = dbCategories.length > 0 
    ? dbCategories.map(c => c.name) 
    : ['Café', 'Té', 'Bebida Fría', 'Comida', 'Postre', 'Otro']; // Fallback inicial

  const categories = ['Todos', ...dynamicCategories];

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    
    let matchesAvailability = true;
    if (availabilityFilter === 'available') {
        matchesAvailability = product.available === true;
    } else if (availabilityFilter === 'unavailable') {
        matchesAvailability = product.available === false;
    }

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleSaveProduct = async (productData) => {
    try {
        const method = productData._id ? 'PUT' : 'POST';
        const res = await fetch('/api/products', {
            method: method,
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (res.ok) {
            const savedProduct = await res.json();
            if (method === 'POST') {
                setProducts([...products.filter(Boolean), savedProduct]);
                toast.success("Producto creado", { description: `${savedProduct?.name || 'Nuevo porducto'} ha sido agregado al menú.` });
            } else {
                if (!savedProduct || !savedProduct._id) {
                    console.error("DEBUG: savedProduct is undefined or has no _id!", savedProduct);
                    toast.error("Error", { description: "Hubo un problema actualizando el estado local. Refresca la página." });
                } else {
                    setProducts(products.filter(Boolean).map(p => p?._id === savedProduct?._id ? savedProduct : p));
                    toast.success("Producto actualizado", { description: `${savedProduct?.name || 'El producto'} ha sido modificado exitosamente.` });
                }
            }
            setIsDialogOpen(false);
            setEditingProduct(null);
        } else {
            const data = await res.json().catch(() => ({}));
            console.error('Error saving product:', data);
            toast.error("Error al guardar", { description: data.error || "No se pudo guardar el producto. Inténtalo de nuevo." });
        }
    } catch (error) {
       console.error('Error saving product:', error);
       toast.error("Error de conexión", { description: "Verifica tu conexión a internet." });
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloneProduct = (product) => {
    // Extract everything except MongoDB and internal fields we don't want copied
    const { _id, createdAt, updatedAt, __v, ...clonedData } = product;
    setEditingProduct({
        ...clonedData,
        name: `${clonedData.name} (Copia)`
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
        const res = await fetch(`/api/products?id=${productToDelete}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setProducts(products.filter(p => p._id !== productToDelete));
            toast.success("Producto eliminado", { description: "El producto ha sido eliminado del menú." });
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
        } else {
            console.error('Error deleting product');
            toast.error("Error al eliminar", { description: "No se pudo eliminar el producto." });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        toast.error("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      {/* Header */}
        <div className="h-16 bg-[#402E24] shadow-md flex items-center px-6 justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.push('/menu')}
                    className="text-[#F5F5F5] hover:bg-white/10 hover:text-white transition-colors"
                >
                    <ArrowLeft />
                </Button>
                <div>
                     <h1 className="text-xl font-bold text-white tracking-wide">Menú de Productos</h1>
                     <p className="text-xs text-gray-300">Gestión de inventario y precios</p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-[500px]">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar productos..." 
                        className="pl-9 h-9 bg-white/10 border-none text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-white/30"
                    />
                </div>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-white/10 border-none text-white focus:ring-1 focus:ring-white/30 truncate">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="available">Disponibles</SelectItem>
                        <SelectItem value="unavailable">Agotados</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

      {/* Tabs de categorías */}
      <div className="bg-white px-4 sm:px-6 py-3 shadow-sm items-center border-b border-gray-100 sticky top-16 z-10 flex justify-between gap-2 sm:gap-4 overflow-hidden w-full">
            <ScrollArea className="flex-1 whitespace-nowrap overflow-hidden max-w-full">
                <div className="flex w-max space-x-2 p-1">
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={activeCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveCategory(category)}
                            className={`rounded-full px-4 transition-all duration-300 ${
                                activeCategory === category 
                                ? "bg-[#402E24] hover:bg-[#2b1f18] text-white shadow-md transform scale-105" 
                                : "text-gray-600 border-gray-200 hover:border-[#402E24] hover:text-[#402E24] bg-transparent"
                            }`}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="shrink-0 border-gray-200 text-gray-600 hover:text-[#402E24] hover:border-[#402E24] bg-gray-50 flex items-center gap-2"
                title="Gestionar Categorías"
            >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Categorías</span>
            </Button>
      </div>

      {/* Grid de productos */}
      <div className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                    Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                    <ProductSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {/* Card para añadir producto */}
                <AddProductCard onClick={handleCreateProduct} />

                {/* Cards de productos */}
                {filteredProducts.map(product => (
                    <ProductCard
                    key={product._id}
                    product={product}
                    onEdit={() => handleEditProduct(product)}
                    onClone={() => handleCloneProduct(product)}
                    onDelete={() => handleDeleteClick(product._id)}
                    />
                ))}
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
                <div className="text-6xl mb-4">☕</div>
                <h3 className="text-xl font-bold text-[#402E24] mb-2">No se encontraron productos</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    Intenta ajustar tu búsqueda o crea un nuevo producto para comenzar.
                </p>
                <Button onClick={handleCreateProduct} className="mt-6 bg-[#402E24] text-white">
                    Crear Nuevo Producto
                </Button>
            </div>
            )}
      </div>

      {/* Dialog para Crear/Editar */}
      <ProductFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
      />

       {/* Alert Dialog para Eliminar */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#402E24] text-xl">¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Esta acción no se puede deshacer. El producto será eliminado permanentemente del menú y no podrá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 text-gray-600 hover:text-[#402E24] hover:bg-gray-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white shadow-md border-none">
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Gestor de Categorías */}
      <CategoryManager 
        open={isCategoryManagerOpen} 
        onOpenChange={(open) => {
            setIsCategoryManagerOpen(open);
            if (!open) fetchCategories(); // Refrescar listado al cerrar por si hubo cambios
        }} 
      />
    </div>
  );
}

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

  useEffect(() => {
    fetchProducts();
  }, []);

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

  // Obtener categorías únicas
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

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
                setProducts([...products, savedProduct]);
                toast.success("Producto creado", { description: `${savedProduct.name} ha sido agregado al menú.` });
            } else {
                setProducts(products.map(p => p._id === savedProduct._id ? savedProduct : p));
                toast.success("Producto actualizado", { description: `${savedProduct.name} ha sido modificado exitosamente.` });
            }
            setIsDialogOpen(false);
            setEditingProduct(null);
        } else {
            console.error('Error saving product');
            toast.error("Error al guardar", { description: "No se pudo guardar el producto. Inténtalo de nuevo." });
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
    <div className="min-h-screen bg-[#F0E0CD]">
      {/* Header */}
        <div className="h-16 bg-[#756046] border-b border-[#A67C52] flex items-center px-4 justify-between shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push('/menu')}>
                    <ArrowLeft className="text-white" />
                </Button>
                <h1 className="text-xl font-bold text-white">Menú de Productos</h1>
            </div>
            <div className="flex items-center gap-3 w-[450px]">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756046]" />
                    <Input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar productos..." 
                        className="pl-9 h-9 bg-[#F0E0CD] border-none focus-visible:ring-[#B68847] text-[#402E24]"
                    />
                </div>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger className="w-[140px] h-9 bg-[#F0E0CD] border-none text-[#402E24] focus:ring-[#B68847]">
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
      <div className="bg-white px-2 py-2 shadow-sm shrink-0 items-center border-b border-[#A67C52]">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 p-1">
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={activeCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveCategory(category)}
                            className={`rounded-full ${activeCategory === category ? "bg-[#402E24]" : "text-[#756046] border-[#A67C52]"}`}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
      </div>

      {/* Grid de productos */}
      <ScrollArea className="flex-1 bg-[#F0E0CD]">
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-[#756046]">
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
                    {[...Array(8)].map((_, i) => (
                    <ProductSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 pb-20">
                {/* Card para añadir producto */}
                <AddProductCard onClick={handleCreateProduct} />

                {/* Cards de productos */}
                {filteredProducts.map(product => (
                    <ProductCard
                    key={product._id}
                    product={product}
                    onEdit={() => handleEditProduct(product)}
                    onDelete={() => handleDeleteClick(product._id)}
                    />
                ))}
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
                <p className="text-lg text-[#756046]">
                No se encontraron productos
                </p>
            </div>
            )}
        </div>
      </ScrollArea>

      {/* Dialog para Crear/Editar */}
      <ProductFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
      />

       {/* Alert Dialog para Eliminar */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#402E24]">¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#A67C52] text-[#402E24]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

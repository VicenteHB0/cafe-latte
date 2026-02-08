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
    return matchesSearch && matchesCategory;
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
            } else {
                setProducts(products.map(p => p._id === savedProduct._id ? savedProduct : p));
            }
            setIsDialogOpen(false);
            setEditingProduct(null);
        } else {
            console.error('Error saving product');
        }
    } catch (error) {
       console.error('Error saving product:', error);
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
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
        } else {
            console.error('Error deleting product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-6 h-6 text-[#3d2817]" />
            </Button>
            <div>
              <h1 
                className="text-3xl text-[#3d2817]"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                Menú de Productos
              </h1>
              <p className="text-sm text-[#8b7355]">
                Gestiona tu catálogo de productos
              </p>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8b7355]" 
            />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-12 py-6 text-lg border-[#c5a880] bg-[#f5f1ed] focus-visible:ring-[#a0826d]"
            />
          </div>
        </div>
      </div>

      {/* Tabs de categorías */}
      <div className="bg-white border-b border-[#e8dfd3]">
        <div className="max-w-7xl mx-auto px-4">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 py-4">
                    {categories.map(category => (
                    <Button
                        key={category}
                        variant={activeCategory === category ? "default" : "secondary"}
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-full ${activeCategory === category ? "bg-[#3d2817] text-white hover:bg-[#3d2817]/90" : "bg-[#f5f1ed] text-[#3d2817] hover:bg-[#e8dfd3]"}`}
                    >
                        {category}
                    </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4">
          <p className="text-sm text-[#8b7355]">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <p className="text-lg text-[#8b7355]">
              No se encontraron productos
            </p>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#3d2817]">¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e8dfd3] text-[#3d2817]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

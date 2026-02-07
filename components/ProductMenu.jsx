"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft } from 'lucide-react';
import { mockProducts } from '../data/mockProducts';
import { ProductCard } from './ProductCard';
import { AddProductCard } from './AddProductCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function ProductMenu() {
  const router = useRouter();
  const onBack = () => router.push('/menu');
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Obtener categorías únicas
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      _id: Date.now().toString()
    };
    setProducts([...products, productWithId]);
  };

  const handleEditProduct = (product) => {
    console.log('Editar producto:', product);
    // Aquí puedes implementar la lógica de edición
  };

  const handleDeleteProduct = (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p._id !== id));
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Card para añadir producto */}
          <AddProductCard onAdd={handleAddProduct} />

          {/* Cards de productos */}
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-[#8b7355]">
              No se encontraron productos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

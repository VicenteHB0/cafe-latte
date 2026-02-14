"use client";

import { Search, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ProductGridItem({ product, onClick }) {
    return (
        <Card 
            onClick={() => onClick(product)}
            className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-[#A67C52] hover:bg-[#F0E0CD] active:scale-95"
        >
            <CardContent className="p-4 flex flex-col h-full justify-between">
                <div>
                    <h3 className="font-bold text-[#402E24] line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-[#756046] line-clamp-2 mt-1">{product.description}</p>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <span className="font-bold text-[#402E24]">
                        ${product.price}
                    </span>
                    {product.available ? (
                        <div className="bg-[#402E24] text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                            <Plus size={14} />
                        </div>
                    ) : (
                        <span className="text-xs text-red-500">Agotado</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function OrderMenu({
  products,
  loading,
  categories,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  onProductClick
}) {
  const router = useRouter();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    return matchesSearch && matchesCategory && product.available;
  });

  return (
    <div className="flex flex-col h-full border-r border-[#A67C52]">
        {/* Header */}
        <div className="h-16 bg-[#756046] border-b border-[#A67C52] flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push('/menu')}>
                    <ArrowLeft className="text-white" />
                </Button>
                <h1 className="text-xl font-bold text-white">Nueva Orden</h1>
            </div>
            <div className="w-1/3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756046]" />
                <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..." 
                    className="pl-9 h-9 bg-[#F0E0CD] border-none text-[#402E24]"
                />
            </div>
        </div>

        {/* Categories */}
        <div className="bg-white px-2 py-2 shadow-sm shrink-0 items-center">
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

        {/* Product Grid */}
        <ScrollArea className="flex-1 min-h-0 bg-[#F0E0CD]">
            <div className="p-4">
                {loading ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 pb-20">
                        {filteredProducts.map(product => (
                            <ProductGridItem 
                                key={product._id} 
                                product={product} 
                                onClick={onProductClick} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    </div>
  );
}

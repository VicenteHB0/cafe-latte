"use client";

import { Search, ArrowLeft, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

function ProductGridItem({ product, onClick }) {
    return (
        <Card 
            onClick={() => onClick(product)}
            className="cursor-pointer bg-white border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden flex flex-col"
        >
            {/* Image Section */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                {product.image ? (
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5] text-gray-400 group-hover:bg-[#EAEAEA] transition-colors">
                        <ImageIcon size={48} strokeWidth={1} className="opacity-50" />
                    </div>
                )}
                
                {/* Available Badge Overlay */}
                {!product.available && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="text-sm font-bold text-red-600 bg-white px-3 py-1.5 rounded-full shadow-md border border-red-100">
                            Agotado
                        </span>
                    </div>
                )}
                
                {/* Category Tag Overlay */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white/95 backdrop-blur-sm text-[#402E24] text-xs font-bold px-2.5 py-1.5 rounded-md shadow-sm border border-gray-100/50">
                        {product.category}
                    </span>
                </div>
            </div>

            <CardContent className="p-4 flex flex-col flex-1 justify-between border-t border-gray-50 bg-white">
                <div>
                    <h3 className="font-bold text-[#402E24] line-clamp-1 text-lg mb-1 group-hover:text-[#A67C52] transition-colors">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description || "Sin descripción"}</p>
                </div>
                <div className="mt-4 flex justify-between items-end">
                    <span className="font-bold text-[#402E24] text-xl">
                        ${product.price}
                    </span>
                    {product.available && (
                        <div className="bg-[#F5F5F5] text-[#402E24] group-hover:bg-[#402E24] group-hover:text-white rounded-full p-2.5 transition-all duration-300 shadow-sm group-hover:shadow-md transform group-hover:scale-105">
                            <Plus size={20} strokeWidth={2.5} />
                        </div>
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
    <div className="flex flex-col h-full border-r border-[#E5E5E5]">
        {/* Header */}
        <div className="h-16 bg-[#402E24] shadow-md flex items-center px-4 justify-between shrink-0 z-10">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push('/menu')} className="text-[#F5F5F5] hover:bg-white/10 hover:text-white">
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold text-white tracking-wide">Nueva Orden</h1>
            </div>
            <div className="w-1/3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto..." 
                    className="pl-9 h-10 bg-white/10 border-none text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#A67C52]"
                />
            </div>
        </div>

        {/* Categories */}
        <div className="bg-white px-4 py-3 shadow-sm shrink-0 items-center z-0 border-b border-gray-100">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2">
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={activeCategory === category ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveCategory(category)}
                            className={`rounded-full px-4 font-medium transition-all ${
                                activeCategory === category 
                                ? "bg-[#402E24] text-white hover:bg-[#2b1f18] shadow-md" 
                                : "text-[#756046] hover:bg-[#F5F5F5] hover:text-[#402E24]"
                            }`}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>

        {/* Product Grid */}
        <ScrollArea className="flex-1 min-h-0 bg-[#F5F5F5]">
            <div className="p-6">
                {loading ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl bg-gray-200" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 pb-20">
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

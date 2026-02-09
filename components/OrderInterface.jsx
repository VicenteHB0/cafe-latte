"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToOrderDialog } from './AddToOrderDialog';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

function ProductGridItem({ product, onClick }) {
    return (
        <Card 
            onClick={() => onClick(product)}
            className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-[#a0826d] hover:bg-[#fffaf5] active:scale-95"
        >
            <CardContent className="p-4 flex flex-col h-full justify-between">
                <div>
                    <h3 className="font-bold text-[#3d2817] line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-[#8b7355] line-clamp-2 mt-1">{product.description}</p>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <span className="font-bold text-[#3d2817]">
                        ${product.price}
                    </span>
                    {product.available ? (
                        <div className="bg-[#3d2817] text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
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

export function OrderInterface() {
  const router = useRouter();
  // const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  // Order State
  const [orderItems, setOrderItems] = useState([]);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [animateTotal, setAnimateTotal] = useState(false); // Animation state

  // Dialog State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    return matchesSearch && matchesCategory && product.available;
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const triggerTotalAnimation = () => {
    setAnimateTotal(true);
    setTimeout(() => setAnimateTotal(false), 300); // Reset after animation
  };

  const addToOrder = (newItem) => {
    setOrderItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => {
        // Compare Product ID
        if (item.product !== newItem.product) return false;
        
        // Compare Size (label)
        const size1 = item.size?.label || null;
        const size2 = newItem.size?.label || null;
        if (size1 !== size2) return false;
        
        // Compare Arrays (Flavors, Sauces, Customizations)
        const compareArrays = (arr1, arr2) => {
            const a1 = arr1 || [];
            const a2 = arr2 || [];
            if (a1.length !== a2.length) return false;
            const sorted1 = [...a1].sort();
            const sorted2 = [...a2].sort();
            return sorted1.every((val, index) => val === sorted2[index]);
        };

        if (!compareArrays(item.flavors, newItem.flavors)) return false;
        if (!compareArrays(item.sauces, newItem.sauces)) return false;
        if (!compareArrays(item.customizations, newItem.customizations)) return false;

        // Compare Extras (Array of objects, compare by name)
        const extras1 = item.extras || [];
        const extras2 = newItem.extras || [];
        if (extras1.length !== extras2.length) return false;
        const sortedExtras1 = [...extras1].map(e => e.name).sort();
        const sortedExtras2 = [...extras2].map(e => e.name).sort();
        if (!sortedExtras1.every((val, index) => val === sortedExtras2[index])) return false;

        return true;
      });

      if (existingItemIndex > -1) {
        // Update existing item
        const newItems = [...currentItems];
        newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + newItem.quantity
        };
        return newItems;
      } else {
        // Add new item
        return [...currentItems, { ...newItem, id: Date.now() }];
      }
    });

    triggerTotalAnimation();
  };

  const removeFromOrder = (itemId) => {
    setOrderItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === itemId) {
          if (item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
            return null; // Flag for removal
          }
        }
        return item;
      }).filter(Boolean); // Remove nulls
    });
    triggerTotalAnimation();
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) return;
    if (!customerName.trim()) {
        toast.error("El nombre del cliente es obligatorio");
        return;
    }

    try {
        const orderData = {
            customerName: customerName.trim(),
            phoneNumber: phoneNumber.trim(),
            items: orderItems.map(({ id, ...rest }) => rest), // Remove frontend ID
            total: calculateTotal(),
            paymentMethod,
            status: 'pending'
        };

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            // Success
            setOrderItems([]);
            setCustomerName('');
            setPhoneNumber('');
            toast.success("Orden Creada", {
                description: "El pedido se ha enviado a cocina.",
            });
        } else {
            toast.error("Error al enviar la orden");
        }
    } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Error de conexión");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f5f1ed] overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
        
        {/* LEFT SIDE: Menu & Products */}
        <ResizablePanel defaultSize="65" minSize="30">
            <div className="flex flex-col h-full border-r border-[#e8dfd3]">
                {/* Header */}
                <div className="h-16 bg-white border-b border-[#e8dfd3] flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/menu')}>
                            <ArrowLeft className="text-[#3d2817]" />
                        </Button>
                        <h1 className="text-xl font-bold text-[#3d2817]">Nueva Orden</h1>
                    </div>
                    <div className="w-1/3 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b7355]" />
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar..." 
                            className="pl-9 h-9 bg-[#f5f1ed] border-none"
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
                                    className={`rounded-full ${activeCategory === category ? "bg-[#3d2817]" : "text-[#8b7355] border-[#e8dfd3]"}`}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>

                {/* Product Grid */}
                <ScrollArea className="flex-1 min-h-0 bg-[#f5f1ed]">
                    <div className="p-4">
                        {loading ? (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 pb-20">
                                {filteredProducts.map(product => (
                                    <ProductGridItem 
                                        key={product._id} 
                                        product={product} 
                                        onClick={handleProductClick} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* RIGHT SIDE: Current Order (Cart) */}
        <ResizablePanel defaultSize="35" minSize="25" maxSize="50">
            <div className="flex flex-col h-full bg-white shadow-2xl z-10 overflow-hidden">
                <div className="p-4 border-b border-[#e8dfd3] bg-[#fffaf5] shrink-0">
                    <h2 className="font-bold text-[#3d2817] text-lg flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" /> Detalle del Pedido
                    </h2>
                    <div className="space-y-2 mt-3">
                        <Input 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Nombre del Cliente *" 
                            className="bg-white border-[#c5a880] h-9"
                        />
                        <Input 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Teléfono (Opcional)" 
                            className="bg-white border-[#c5a880] h-9"
                        />
                    </div>
                </div>

                {/* Order Items List */}
                <ScrollArea className="flex-1 min-h-0 bg-white">
                    <div className="p-4 space-y-3">
                        {orderItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-[#c5a880] opacity-50 py-10">
                                <ShoppingCart className="w-16 h-16 mb-2" />
                                <p>Orden vacía</p>
                            </div>
                        ) : (
                            orderItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-start p-2 hover:bg-[#f9f9f9] rounded-lg group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#3d2817]">{item.quantity}x</span>
                                            <span className="font-medium text-[#3d2817]">{item.name}</span>
                                        </div>
                                        {item.size && <div className="text-xs text-[#8b7355] ml-6">Tamaño: {item.size.label}</div>}
                                        {item.flavors?.length > 0 && <div className="text-xs text-[#8b7355] ml-6">Sabor: {item.flavors.join(', ')}</div>}
                                        {item.sauces?.length > 0 && <div className="text-xs text-[#8b7355] ml-6">Salsas: {item.sauces.join(', ')}</div>}
                                        {item.extras?.map((extra, idx) => (
                                            <div key={idx} className="text-xs text-[#8b7355] ml-6">+ {extra.name}</div>
                                        ))}
                                        {item.customizations?.map((note, idx) => (
                                            <div key={idx} className="text-xs text-[#a0826d] italic ml-6">"{note}"</div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-bold text-[#3d2817]">${item.price * item.quantity}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => removeFromOrder(item.id)}
                                        >
                                            {item.quantity > 1 ? <Minus size={14} /> : <Trash2 size={14} />}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Footer: Totals & Action */}
                <div className="p-4 bg-[#fffaf5] border-t border-[#e8dfd3] space-y-4 shrink-0">
                    <div className="flex justify-between items-center text-sm text-[#8b7355]">
                        <span>Artículos</span>
                        <span>{orderItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-[#3d2817]">
                        <span>Total</span>
                        <span className={`transition-transform duration-300 ${animateTotal ? 'scale-125 text-[#a0826d]' : 'scale-100'}`}>
                            ${calculateTotal()}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('cash')}
                            className={`w-full ${paymentMethod === 'cash' ? 'bg-[#3d2817]' : 'border-[#3d2817] text-[#3d2817]'}`}
                            size="sm"
                        >
                            <Banknote className="w-4 h-4 mr-2" /> Efectivo
                        </Button>
                        <Button 
                            variant={paymentMethod === 'card' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('card')}
                            className={`w-full ${paymentMethod === 'card' ? 'bg-[#3d2817]' : 'border-[#3d2817] text-[#3d2817]'}`}
                            size="sm"
                        >
                            <CreditCard className="w-4 h-4 mr-2" /> Tarjeta
                        </Button>
                    </div>

                    <Button 
                        className="w-full bg-[#3d2817] hover:bg-[#5c3d2e] text-white h-12 text-lg"
                        disabled={orderItems.length === 0 || !customerName.trim()}
                        onClick={handlePlaceOrder}
                    >
                        Confirmar Orden
                    </Button>
                </div>
            </div>
        </ResizablePanel>
      
      </ResizablePanelGroup>

      <AddToOrderDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        product={selectedProduct} 
        onAddToOrder={addToOrder}
      />
    </div>
  );
}

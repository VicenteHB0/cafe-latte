"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AddToOrderDialog } from './AddToOrderDialog';
import { toast } from "sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OrderMenu } from './order/OrderMenu';
import { OrderCart } from './order/OrderCart';
// import { useIsMobile } from "@/components/ui/use-mobile";

// Custom hook to detect mobile since use-mobile might not be exported correctly or we want explicit control
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
}

export function OrderInterface({ initialOrder = null }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  // Mobile View State
  const [mobileView, setMobileView] = useState('menu'); // 'menu' or 'cart'

  // Order State
  // Identify items with unique IDs for frontend if coming from backend
  const [orderItems, setOrderItems] = useState(
    initialOrder?.items.map(item => ({ ...item, id: Date.now() + Math.random() })) || []
  );
  const [nextOrderNumber, setNextOrderNumber] = useState(initialOrder?.orderNumber || null);

  const [paymentMethod, setPaymentMethod] = useState(initialOrder?.paymentMethod || 'cash');
  const [animateTotal, setAnimateTotal] = useState(false); // Animation state

  // Dialog State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (!initialOrder) {
        fetchNextOrderNumber();
    }
  }, []);

  const fetchNextOrderNumber = async () => {
    try {
        const res = await fetch('/api/orders?nextNumber=true');
        if (res.ok) {
            const data = await res.json();
            setNextOrderNumber(data.nextNumber);
        }
    } catch (error) {
        console.error("Error fetching next order number:", error);
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

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const triggerTotalAnimation = () => {
    setAnimateTotal(true);
    setTimeout(() => setAnimateTotal(false), 300); // Reset after animation
  };

  const addToOrder = (newItem) => {
    console.log("Adding item:", newItem);
    setOrderItems(currentItems => {
      console.log("Current items:", currentItems);
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

      console.log("Index found:", existingItemIndex);

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
    // toast.success("Agregado al pedido", { duration: 1000 });
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

    try {
        const orderData = {
            // customerName is now optional/auto-generated
            items: orderItems.map(({ id, ...rest }) => rest), // Remove frontend ID
            total: calculateTotal(),
            paymentMethod,
            status: initialOrder ? initialOrder.status : 'pending' // Preserve status on edit
        };

        let res;
        
        if (initialOrder) {
            // UPDATE
            res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...orderData, id: initialOrder._id })
            });
        } else {
            // CREATE
            res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
        }

        if (res.ok) {
            // Success
            if (initialOrder) {
                toast.success("Orden Actualizada");
                router.push('/orders/board'); // Return to board
            } else {
                setOrderItems([]);
                fetchNextOrderNumber(); // Refresh for next order
                setMobileView('menu'); // Go back to menu on mobile
                toast.success("Orden Creada", {
                    description: "El pedido se ha enviado a cocina.",
                });
            }
        } else {
            toast.error(initialOrder ? "Error al actualizar" : "Error al enviar la orden");
        }
    } catch (error) {
        console.error("Error creating/updating order:", error);
        toast.error("Error de conexión");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f5f1ed] overflow-hidden relative">
      {isMobile ? (
        // MOBILE LAYOUT
        <div className="flex-1 h-full overflow-hidden flex flex-col">
            {mobileView === 'menu' ? (
                <>
                    <OrderMenu 
                        products={products}
                        loading={loading}
                        categories={categories}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onProductClick={handleProductClick}
                    />
                    {/* Floating Cart Button */}
                    {orderItems.length > 0 && (
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                            <Button 
                                className="w-full bg-[#402E24] text-white shadow-xl h-14 rounded-full flex justify-between px-6 items-center"
                                onClick={() => setTimeout(() => setMobileView('cart'), 0)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
                                        {orderItems.reduce((acc, item) => acc + item.quantity, 0)}
                                    </div>
                                    <span>Ver Pedido</span>
                                </div>
                                <span className="font-bold text-lg">${calculateTotal()}</span>
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="h-full flex flex-col">
                    <div className="bg-white p-2 border-b border-[#A67C52] flex items-center">
                         <Button variant="ghost" onClick={() => setTimeout(() => setMobileView('menu'), 0)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú
                         </Button>
                    </div>
                    <OrderCart 
                        orderItems={orderItems}
                        nextOrderNumber={nextOrderNumber}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        removeFromOrder={removeFromOrder}
                        placeOrder={handlePlaceOrder}
                        calculateTotal={calculateTotal}
                        animateTotal={animateTotal}
                        isEditMode={!!initialOrder}
                    />
                </div>
            )}
        </div>
      ) : (
        // DESKTOP LAYOUT (Resizable Panels)
        <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
            {/* LEFT SIDE: Menu & Products */}
            <ResizablePanel defaultSize="65" minSize="30">
                <OrderMenu 
                    products={products}
                    loading={loading}
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onProductClick={handleProductClick}
                />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* RIGHT SIDE: Current Order (Cart) */}
            <ResizablePanel defaultSize="35" minSize="25" maxSize="50">
                <OrderCart 
                    orderItems={orderItems}
                    nextOrderNumber={nextOrderNumber}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    removeFromOrder={removeFromOrder}
                    placeOrder={handlePlaceOrder}
                    calculateTotal={calculateTotal}
                    animateTotal={animateTotal}
                    isEditMode={!!initialOrder}
                />
            </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <AddToOrderDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        product={selectedProduct} 
        onAddToOrder={addToOrder}
      />
    </div>
  );
}

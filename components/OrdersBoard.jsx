"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Check, Clock, Package, ChefHat, ArrowRight, ArrowLeft, MoreVertical, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLUMN_CONFIG = {
  pending: {
    title: 'Nuevas',
    color: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    icon: Clock,
    textColor: 'text-yellow-800'
  },
  preparing: {
    title: 'En Preparación',
    color: 'bg-blue-100',
    borderColor: 'border-blue-400',
    icon: ChefHat,
    textColor: 'text-blue-800'
  },
  ready: {
    title: 'Listas',
    color: 'bg-green-100',
    borderColor: 'border-green-400',
    icon: Check,
    textColor: 'text-green-800'
  },
  completed: {
    title: 'Entregadas',
    color: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: Package,
    textColor: 'text-gray-600'
  }
};

export function OrdersBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef(null);
  const router = useRouter();

  // Deletion State
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit State
  const [orderToEdit, setOrderToEdit] = useState(null); // The one open in the EDIT MODAL
  const [orderToConfirmEdit, setOrderToConfirmEdit] = useState(null); // The one waiting for password/confirmation
  const [editConfirmation, setEditConfirmation] = useState("");

  // ... (useEffects)

  // ... (fetchOrders, setupRealTimeConnection, updateStatus)

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteReason("");
  };

  const handleEditClick = (order) => {
    // If pending, direct edit? User said "not return to panel". 
    // So for both pending and preparing, we show the modal.
    // For preparing, we still ask for confirmation first.
    
    if (order.status === 'pending') {
         setOrderToEdit(order); // Opens the edit modal directly
    } else {
        // Confirmation needed for preparing orders
        // We use a temporary state for confirmation logic, then setOrderToEdit
        setOrderToConfirmEdit(order);
        setEditConfirmation("");
    }
  };

  const confirmEditAuth = () => {
    if (orderToConfirmEdit && editConfirmation === `Orden #${orderToConfirmEdit.orderNumber}`) {
        setOrderToEdit(orderToConfirmEdit); // Should open the main Edit Modal
        setOrderToConfirmEdit(null); // Close auth dialog
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    if (orderToDelete.status === 'preparing' && deleteReason !== `Orden #${orderToDelete.orderNumber}`) {
        toast.error("La confirmación no coincide");
        return;
    }

    try {
        setIsDeleting(true);
        const res = await fetch(`/api/orders?id=${orderToDelete._id}`, {
            method: 'DELETE',
        });

        if (!res.ok) throw new Error("Failed to delete");
        
        toast.success(`Orden #${orderToDelete.orderNumber} eliminada`);
        setOrderToDelete(null); // Close dialog
        
        // Remove from local state immediately (SSE will keep it in sync, but this feels faster)
        setOrders(prev => prev.filter(o => o._id !== orderToDelete._id));

    } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Error al eliminar la orden");
    } finally {
        setIsDeleting(false);
    }
  };
  useEffect(() => {
    fetchOrders();
    setupRealTimeConnection();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeConnection = () => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/orders/events');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("SSE Connection Opened");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
            // console.log("SSE Connected");
        } else if (data.type === 'insert') {
            const newOrder = data.document;
            setOrders(prev => [newOrder, ...prev]);
            toast.info(`Nueva Orden #${newOrder.orderNumber}`);
        } else if (data.type === 'update' || data.type === 'replace') {
            const updatedOrder = data.document;
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        } else if (data.type === 'delete') {
            const deletedId = data.documentKey._id;
            setOrders(prev => prev.filter(o => o._id !== deletedId));
        }

      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      // Retry connection after 5 seconds if closed
      if (eventSource.readyState === EventSource.CLOSED) {
          setTimeout(setupRealTimeConnection, 5000);
      }
    };
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
        const res = await fetch(`/api/orders`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status: newStatus })
        });
        
        if (!res.ok) throw new Error("Failed to update");

    } catch (error) {
        toast.error("Error al actualizar estado");
    }
  };



  const getColumns = () => {
    const columns = {
        pending: [],
        preparing: [],
        ready: [],
        completed: []
    };

    orders.forEach(order => {
        if (columns[order.status]) {
            columns[order.status].push(order);
        }
    });
    
    return columns;
  };

  const columns = getColumns();

  if (loading) return <div className="p-8 text-center">Cargando panel...</div>;

  return (
    <div className="h-screen flex flex-col bg-[#F0E0CD] overflow-hidden">
        {/* Header Consistente */}
        <div className="h-16 bg-[#756046] border-b border-[#A67C52] flex items-center px-4 justify-between shrink-0 mb-4">
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.push('/menu')}
                    className="text-white hover:bg-[#A67C52] hover:text-white"
                >
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold text-white">Panel de Órdenes (KDS)</h1>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
            {Object.keys(COLUMN_CONFIG).map(status => {
                const config = COLUMN_CONFIG[status];
                const Icon = config.icon;
                const matches = columns[status] || [];

                return (
                    <div key={status} className={`flex flex-col h-full rounded-lg border-t-4 ${config.borderColor} bg-white/50 shadow-sm overflow-hidden`}>
                        <div className={`p-3 ${config.color} flex items-center justify-between rounded-t-sm shrink-0`}>
                            <h2 className={`font-bold flex items-center gap-2 ${config.textColor}`}>
                                <Icon size={18} />
                                {config.title}
                            </h2>
                            <Badge variant="secondary" className="bg-white/80 text-black">
                                {matches.length}
                            </Badge>
                        </div>
                        
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-2 space-y-3">
                                {matches.map(order => (
                                    <OrderCard 
                                        key={order._id} 
                                        order={order} 
                                        status={status}
                                        onUpdateStatus={updateStatus}
                                        onDelete={() => handleDeleteClick(order)}
                                        onEdit={() => handleEditClick(order)}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                );
            })}
        </div>

        {/* Delete Dialog */}
        <Dialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
            <DialogContent className="sm:max-w-md bg-[#F0E0CD] border-[#A67C52]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#402E24]">
                        {orderToDelete?.status === 'preparing' && <AlertTriangle className="text-orange-600 h-5 w-5" />}
                        Eliminar Orden #{orderToDelete?.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-[#756046]">
                        {orderToDelete?.status === 'preparing' 
                            ? "Esta orden ya está en preparación. ¿Estás seguro de que quieres eliminarla? Esta acción no se puede deshacer."
                            : "¿Estás seguro de que quieres eliminar esta orden permanentemente?"
                        }
                    </DialogDescription>
                </DialogHeader>

                {orderToDelete?.status === 'preparing' && (
                    <div className="grid gap-2 py-4">
                        <Label htmlFor="confirmation" className="text-[#402E24]">
                            Para confirmar, escriba <span className="font-bold select-none">Orden #{orderToDelete.orderNumber}</span> abajo:
                        </Label>
                        <Input
                            id="confirmation"
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder={`Orden #${orderToDelete.orderNumber}`}
                            className="bg-white border-[#A67C52]"
                            autoComplete="off"
                        />
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOrderToDelete(null)} className="border-[#A67C52] text-[#402E24]">
                        Cancelar
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={confirmDelete}
                        disabled={
                            isDeleting || 
                            (orderToDelete?.status === 'preparing' && deleteReason !== `Orden #${orderToDelete?.orderNumber}`)
                        }
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar Orden"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Edit Confirmation Dialog (Security Step) */}
        <Dialog open={!!orderToConfirmEdit} onOpenChange={(open) => !open && setOrderToConfirmEdit(null)}>
            <DialogContent className="sm:max-w-md bg-[#F0E0CD] border-[#A67C52]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#402E24]">
                        <AlertTriangle className="text-orange-600 h-5 w-5" />
                        Editar Orden #{orderToConfirmEdit?.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-[#756046]">
                        Esta orden ya está en preparación. Para editarla, debe confirmar su acción.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 py-4">
                    <Label htmlFor="edit-confirmation" className="text-[#402E24]">
                        Para confirmar, escriba <span className="font-bold select-none">Orden #{orderToConfirmEdit?.orderNumber}</span> abajo:
                    </Label>
                    <Input
                        id="edit-confirmation"
                        value={editConfirmation}
                        onChange={(e) => setEditConfirmation(e.target.value)}
                        placeholder={`Orden #${orderToConfirmEdit?.orderNumber}`}
                        className="bg-white border-[#A67C52]"
                        autoComplete="off"
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOrderToConfirmEdit(null)} className="border-[#A67C52] text-[#402E24]">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={confirmEditAuth}
                        disabled={editConfirmation !== `Orden #${orderToConfirmEdit?.orderNumber}`}
                        className="bg-[#402E24] hover:bg-[#2b1f18] text-white"
                    >
                        Continuar a Edición
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* The Actual Edit Modal */}
        {orderToEdit && (
            <EditOrderModal 
                order={orderToEdit} 
                open={!!orderToEdit} 
                onOpenChange={(open) => !open && setOrderToEdit(null)}
                onSave={(updatedOrder) => {
                    // Update local state directly for speed, SSE will confirm
                     setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
                     setOrderToEdit(null);
                }}
            />
        )}
    </div>
  );
}

import { AddToOrderDialog } from "./AddToOrderDialog";

// ... (OrderCard component remains the same)

function EditOrderModal({ order, open, onOpenChange, onSave }) {
    const [items, setItems] = useState(order.items || []);
    const [isSaving, setIsSaving] = useState(false);
    
    // State for Item Editing
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);

    const calculateTotal = () => items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleRemoveItem = (e, index) => {
        e.stopPropagation(); // Prevent opening edit modal
        const newItems = [...items];
        if (newItems[index].quantity > 1) {
            newItems[index].quantity -= 1;
        } else {
            newItems.splice(index, 1);
        }
        setItems(newItems);
    };

    const handleItemClick = async (item, index) => {
        try {
            setIsLoadingProduct(true);
            const res = await fetch(`/api/products?id=${item.product}`);
            if (res.ok) {
                const product = await res.json();
                setEditingProduct(product);
                setEditingItemIndex(index);
            } else {
                toast.error("Error al cargar detalles del producto");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Error de conexión");
        } finally {
            setIsLoadingProduct(false);
        }
    };

    const handleUpdateItem = (updatedItem) => {
        const newItems = [...items];
        // Merge the updated fields into the existing item, but keep the ID if it had one (though new items are array elements)
        // updatedItem comes from AddToOrderDialog which mimics a "fresh" item
        // We need to ensure we don't lose the product reference ID
        newItems[editingItemIndex] = {
            ...newItems[editingItemIndex],
            ...updatedItem
        };
        setItems(newItems);
        setEditingProduct(null);
        setEditingItemIndex(null);
    };

    const handleSave = async () => {
        if (items.length === 0) {
            toast.error("La orden no puede estar vacía. Elimínela si es necesario.");
            return;
        }

        try {
            setIsSaving(true);
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: order._id,
                    items: items,
                    total: calculateTotal()
                })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                toast.success("Orden actualizada correctamente");
                onSave(updatedOrder);
            } else {
                toast.error("Error al actualizar la orden");
            }
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error("Error de conexión");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-[#f9f5f1] border-[#A67C52] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0 bg-[#F0E0CD] border-b border-[#A67C52]">
                    <DialogTitle className="text-2xl font-bold text-[#402E24] serifs">
                        Editar Orden #{order.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-[#756046]">
                        Haga clic en un producto para editarlo.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-4">
                        {items.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">Orden vacía</p>
                        ) : (
                            items.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleItemClick(item, idx)}
                                    className="flex justify-between items-start p-3 bg-white rounded-lg shadow-sm border border-[#eaddcf] cursor-pointer hover:bg-orange-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#402E24] text-lg">{item.quantity}x</span>
                                            <span className="font-bold text-[#402E24] text-lg">{item.name}</span>
                                        </div>
                                        {/* Modifiers */}
                                        <div className="mt-1 space-y-1">
                                            {item.size && <div className="text-xs text-[#756046]">Tamaño: {item.size.label}</div>}
                                            {item.flavors?.length > 0 && <div className="text-xs text-[#756046]">Sabor: {item.flavors.join(', ')}</div>}
                                            {item.sauces?.length > 0 && <div className="text-xs text-[#756046]">Salsas: {item.sauces.join(', ')}</div>}
                                            {item.extras?.map((extra, i) => (
                                                <div key={i} className="text-xs text-[#756046]">+ {extra.name}</div>
                                            ))}
                                            {item.customizations?.map((note, i) => (
                                                <div key={i} className="text-xs text-[#A67C52] italic">"{note}"</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="font-bold text-[#402E24]">${item.price * item.quantity}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={(e) => handleRemoveItem(e, idx)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                        >
                                            {item.quantity > 1 ? <div className="font-bold text-lg">-</div> : <Trash2 size={16} />}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-4 bg-[#F0E0CD] border-t border-[#A67C52] gap-2 md:gap-0 shrink-0">
                    <div className="flex-1 flex items-center">
                        <span className="text-xl font-bold text-[#402E24]">Total: ${calculateTotal()}</span>
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#A67C52] text-[#402E24]">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || items.length === 0}
                        className="bg-[#402E24] hover:bg-[#2b1f18] text-white"
                    >
                        {isSaving ? "Guardando..." : "Actualizar Orden"}
                    </Button>
                </DialogFooter>

                {/* Nested Dialog for Item Editing */}
                {editingProduct && (
                    <AddToOrderDialog 
                        open={!!editingProduct} 
                        onOpenChange={(open) => !open && setEditingProduct(null)}
                        product={editingProduct}
                        initialItem={items[editingItemIndex]}
                        onAddToOrder={handleUpdateItem}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function OrderCard({ order, status, onUpdateStatus, onDelete, onEdit }) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#A67C52] overflow-hidden group relative">
            <CardHeader className="p-3 pb-0 gap-0 space-y-0">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-[#402E24] leading-none">
                        Orden #{order.orderNumber}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono bg-slate-100 px-1 rounded">
                            {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {(status === 'pending' || status === 'preparing') && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-100 rounded-full">
                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={onEdit} className="text-[#402E24] cursor-pointer">
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onDelete} className="text-red-600 cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-3 pt-0 -mt-1">
                {/* Items */}
                <div className="space-y-1 mb-3">
                    {order.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="text-sm flex justify-between">
                            <span className="font-medium text-[#402E24]">
                                {item.quantity}x {item.name}
                            </span>
                        </div>
                    ))}
                    {order.items.length > 4 && (
                        <p className="text-xs text-muted-foreground italic">
                            + {order.items.length - 4} más...
                        </p>
                    )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-2">
                    {status === 'pending' && (
                        <Button 
                            className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white" 
                            onClick={() => onUpdateStatus(order._id, 'preparing')}
                        >
                            Preparar
                        </Button>
                    )}
                    {status === 'preparing' && (
                        <Button 
                            className="w-full h-8 bg-green-600 hover:bg-green-700 text-white" 
                            onClick={() => onUpdateStatus(order._id, 'ready')}
                        >
                            Listo
                        </Button>
                    )}
                    {status === 'ready' && (
                        <Button 
                            className="w-full h-8 bg-gray-600 hover:bg-gray-700 text-white" 
                            onClick={() => onUpdateStatus(order._id, 'completed')}
                        >
                            Entregar
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

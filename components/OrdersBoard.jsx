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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F5F5F5] text-[#402E24]">Cargando panel...</div>;

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F5] overflow-hidden font-sans">
        {/* Header Consistente */}
        <div className="h-16 bg-[#402E24] shadow-md flex items-center px-6 justify-between shrink-0 z-10">
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
                     <h1 className="text-xl font-bold text-white tracking-wide">Panel de Órdenes</h1>
                     <p className="text-xs text-gray-300">Gestión de cocina en tiempo real</p>
                </div>
            </div>
             {/* <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-white/90">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    En línea
                 </div>
            </div> */}
        </div>

        <div className="flex-1 grid grid-cols-4 gap-6 min-h-0 p-6">
            {Object.keys(COLUMN_CONFIG).map(status => {
                const config = COLUMN_CONFIG[status];
                const Icon = config.icon;
                const matches = columns[status] || [];

                return (
                    <div key={status} className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className={`p-4 border-b border-gray-100 flex items-center justify-between shrink-0 ${status === 'pending' ? 'bg-yellow-50' : status === 'preparing' ? 'bg-blue-50' : status === 'ready' ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.color.replace('bg-', 'bg-').replace('100', '200')}`}>
                                    <Icon size={20} className={config.textColor} />
                                </div>
                                <h2 className={`font-bold text-lg ${config.textColor}`}>
                                    {config.title}
                                </h2>
                            </div>
                            <span className="bg-white px-2.5 py-0.5 rounded-full text-sm font-bold text-gray-600 shadow-sm border border-gray-100">
                                {matches.length}
                            </span>
                        </div>
                        
                        <ScrollArea className="flex-1 min-h-0 bg-[#FAFAFA]">
                            <div className="p-4 space-y-4">
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
            <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#402E24] text-xl">
                        {orderToDelete?.status === 'preparing' && <AlertTriangle className="text-orange-500 h-6 w-6" />}
                        Eliminar Orden #{orderToDelete?.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        {orderToDelete?.status === 'preparing' 
                            ? "Esta orden ya está en preparación. ¿Estás seguro de que quieres eliminarla? Esta acción no se puede deshacer."
                            : "¿Estás seguro de que quieres eliminar esta orden permanentemente?"
                        }
                    </DialogDescription>
                </DialogHeader>

                {orderToDelete?.status === 'preparing' && (
                    <div className="grid gap-3 py-4">
                        <Label htmlFor="confirmation" className="text-[#402E24] font-medium">
                            Para confirmar, escriba <span className="font-bold select-none bg-gray-100 px-1 rounded">Orden #{orderToDelete.orderNumber}</span> abajo:
                        </Label>
                        <Input
                            id="confirmation"
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder={`Orden #${orderToDelete.orderNumber}`}
                            className="bg-gray-50 border-gray-200 focus-visible:ring-[#402E24]"
                            autoComplete="off"
                        />
                    </div>
                )}

                <DialogFooter className="gap-3 sm:gap-0">
                    <Button variant="ghost" onClick={() => setOrderToDelete(null)} className="text-gray-500 hover:text-[#402E24]">
                        Cancelar
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={confirmDelete}
                        disabled={
                            isDeleting || 
                            (orderToDelete?.status === 'preparing' && deleteReason !== `Orden #${orderToDelete?.orderNumber}`)
                        }
                        className="bg-red-500 hover:bg-red-600 shadow-md"
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar Orden"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Edit Confirmation Dialog (Security Step) */}
        <Dialog open={!!orderToConfirmEdit} onOpenChange={(open) => !open && setOrderToConfirmEdit(null)}>
            <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#402E24] text-xl">
                        <AlertTriangle className="text-orange-500 h-6 w-6" />
                        Editar Orden #{orderToConfirmEdit?.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Esta orden ya está en preparación. Para editarla, debe confirmar su acción.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-4">
                    <Label htmlFor="edit-confirmation" className="text-[#402E24] font-medium">
                        Para confirmar, escriba <span className="font-bold select-none bg-gray-100 px-1 rounded">Orden #{orderToConfirmEdit?.orderNumber}</span> abajo:
                    </Label>
                    <Input
                        id="edit-confirmation"
                        value={editConfirmation}
                        onChange={(e) => setEditConfirmation(e.target.value)}
                        placeholder={`Orden #${orderToConfirmEdit?.orderNumber}`}
                        className="bg-gray-50 border-gray-200 focus-visible:ring-[#402E24]"
                        autoComplete="off"
                    />
                </div>

                <DialogFooter className="gap-3 sm:gap-0">
                    <Button variant="ghost" onClick={() => setOrderToConfirmEdit(null)} className="text-gray-500 hover:text-[#402E24]">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={confirmEditAuth}
                        disabled={editConfirmation !== `Orden #${orderToConfirmEdit?.orderNumber}`}
                        className="bg-[#402E24] hover:bg-[#2b1f18] text-white shadow-md"
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

// ... (OrderCard component styled below)

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
            <DialogContent className="sm:max-w-lg bg-white border-none shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-4 shrink-0 bg-[#FAFAFA] border-b border-gray-100">
                    <DialogTitle className="text-2xl font-bold text-[#402E24] tracking-tight">
                        Editar Orden #{order.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Haga clic en un producto para editarlo.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-3">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Package size={48} className="mb-2 opacity-20" />
                                <p>Orden vacía</p>
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleItemClick(item, idx)}
                                    className="flex justify-between items-start p-4 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-[#A67C52] hover:shadow-md transition-all group"
                                >
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 bg-[#402E24] text-white text-xs font-bold rounded-full shrink-0">
                                                {item.quantity}
                                            </span>
                                            <span className="font-bold text-[#402E24] text-lg">{item.name}</span>
                                        </div>
                                        {/* Modifiers */}
                                        <div className="mt-2 pl-9 space-y-1">
                                            {item.size && <div className="text-xs text-gray-500 font-medium">Tamaño: {item.size.label}</div>}
                                            {item.flavors?.length > 0 && (
                                                <div className="text-xs text-gray-500 flex flex-wrap gap-1">
                                                    Sabor: {item.flavors.map((f, i) => (
                                                        <span key={i} className="font-medium">
                                                            {f.name || f}{f.price ? ` (+$${f.price})` : ''}{i < item.flavors.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {item.sauces?.length > 0 && <div className="text-xs text-gray-500">Salsas: {item.sauces.join(', ')}</div>}
                                            {item.extras?.map((extra, i) => (
                                                <div key={i} className="text-xs text-[#A67C52] font-medium">+ {extra.name}</div>
                                            ))}
                                            {item.customizations?.map((note, i) => (
                                                <div key={i} className="text-xs text-gray-400 italic">"{note}"</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <span className="font-bold text-[#402E24]">${item.price * item.quantity}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={(e) => handleRemoveItem(e, idx)}
                                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 rounded-full transition-colors"
                                        >
                                            {item.quantity > 1 ? <div className="font-bold text-lg">-</div> : <Trash2 size={16} />}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 bg-white border-t border-gray-100 gap-2 md:gap-0 shrink-0">
                    <div className="flex-1 flex items-center">
                        <span className="text-xl font-bold text-[#402E24]">Total: <span className="text-2xl">${calculateTotal()}</span></span>
                    </div>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-[#402E24]">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || items.length === 0}
                        className="bg-[#402E24] hover:bg-[#2b1f18] text-white shadow-lg px-6"
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ... (EditOrderModal remains unchanged)

function OrderCard({ order, status, onUpdateStatus, onDelete, onEdit }) {
    // Determine card styling based on status
    const isNew = status === 'pending';
    const isPreparing = status === 'preparing';
    
    return (
        <Card className={`group relative transition-all duration-300 border-none shadow-sm hover:shadow-md overflow-hidden ${isNew ? 'ring-2 ring-yellow-400/50' : ''}`}>
             {/* Status indicator strip */}
             <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                 status === 'pending' ? 'bg-yellow-400' : 
                 status === 'preparing' ? 'bg-blue-400' : 
                 status === 'ready' ? 'bg-green-500' : 'bg-gray-300'
             }`}></div>

            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                         <div className="flex items-baseline gap-2">
                            <h3 className="text-xl font-bold text-[#402E24]">
                                #{order.orderNumber}
                            </h3>
                            <span className="text-xs font-mono text-gray-400">
                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                         </div>
                         <div className="text-sm font-bold text-[#A67C52] mt-0.5">
                            Total: ${order.total}
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {(status === 'pending' || status === 'preparing') && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-[#402E24] hover:bg-gray-100 rounded-full">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem onClick={onEdit} className="text-[#402E24] cursor-pointer font-medium">
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onDelete} className="text-red-500 cursor-pointer font-medium focus:text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardHeader>

            <Popover>
                <PopoverTrigger asChild>
                    <CardContent className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                        {/* Items Preview */}
                        <div className="space-y-1.5">
                            {order.items.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="text-sm flex items-center gap-2 text-gray-700">
                                     <span className="font-bold text-[#402E24] w-5 text-right shrink-0">{item.quantity}</span>
                                     <span className="line-clamp-1">{item.name}</span>
                                </div>
                            ))}
                            {order.items.length > 3 && (
                                <p className="text-xs text-[#A67C52] font-medium pl-7 pt-1">
                                    + {order.items.length - 3} artículos más...
                                </p>
                            )}
                        </div>
                    </CardContent>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-80 p-0 bg-white border-none shadow-xl rounded-xl overflow-hidden" 
                    align="start" 
                    sideOffset={5}
                >
                    <div className="bg-[#402E24] px-4 py-3 text-white flex justify-between items-center">
                         <span className="font-bold">Orden #{order.orderNumber}</span>
                         <span className="text-white/80 text-sm">Detalle completo</span>
                    </div>
                    <ScrollArea className="h-[320px] bg-[#FAFAFA]">
                        <div className="p-4 space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                             <span className="font-bold text-[#402E24] bg-gray-100 px-2 rounded-md h-6 flex items-center">{item.quantity}</span>
                                             <span className="font-bold text-[#402E24] text-base">{item.name}</span>
                                        </div>
                                        <span className="text-gray-500 font-medium">${item.price * item.quantity}</span>
                                    </div>
                                    <div className="pl-9 mt-1 space-y-1">
                                        {item.size && <div className="text-xs text-gray-500 bg-white inline-block px-1.5 rounded border border-gray-100 mr-1">{item.size.label}</div>}
                                        {item.flavors?.length > 0 && (
                                            <div className="text-xs text-gray-500 flex flex-wrap gap-1">
                                                Sabor: {item.flavors.map((f, i) => (
                                                    <span key={i} className="font-medium bg-gray-100 px-1.5 rounded mr-1">
                                                        {f.name || f}{f.price ? ` (+$${f.price})` : ''}{i < item.flavors.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {item.sauces?.length > 0 && <div className="text-xs text-gray-500">Salsas: {item.sauces.join(', ')}</div>}
                                        {item.extras?.map((extra, i) => (
                                            <div key={i} className="text-xs text-[#A67C52] font-medium">+ {extra.name} + (${extra.price})</div>
                                        ))}
                                        {item.customizations?.map((note, i) => (
                                            <div key={i} className="text-xs text-gray-400 italic bg-yellow-50 p-1.5 rounded-md mt-1">"{note}"</div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <div className="px-4 pb-4 pl-5">
                <div className="grid gap-2">
                    {status === 'pending' && (
                        <Button 
                            className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium transition-all active:scale-95" 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, 'preparing'); }}
                        >
                            Comenzar Preparación
                        </Button>
                    )}
                    {status === 'preparing' && (
                        <Button 
                            className="w-full h-9 bg-green-600 hover:bg-green-700 text-white shadow-sm font-medium transition-all active:scale-95 animate-pulse hover:animate-none" 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, 'ready'); }}
                        >
                            Marcar como Listo
                        </Button>
                    )}
                    {status === 'ready' && (
                        <Button 
                            className="w-full h-9 bg-[#402E24] hover:bg-[#2b1f18] text-white shadow-sm font-medium transition-all active:scale-95" 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, 'completed'); }}
                        >
                            Entregar Orden
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

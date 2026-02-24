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
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const COLUMN_CONFIG = {
  pending: {
    title: 'Nuevas',
    color: 'bg-[#F0E0CD]', // Cream/Light Tan
    borderColor: 'border-[#A67C52]',
    icon: Clock,
    textColor: 'text-[#402E24]' // Dark Brown
  },
  preparing: {
    title: 'En Preparación',
    color: 'bg-[#E3CBA8]', // Warmer Light Tan
    borderColor: 'border-[#A67C52]',
    icon: ChefHat,
    textColor: 'text-[#402E24]'
  },
  ready: {
    title: 'Listas',
    color: 'bg-[#D2B690]', // Medium warm tan/gold
    borderColor: 'border-[#8A623A]',
    icon: Check,
    textColor: 'text-[#2b1f18]' // Deeper Brown
  },
  completed: {
    title: 'Entregadas',
    color: 'bg-[#FAFAFA]', // Off-white/Grayish
    borderColor: 'border-gray-200',
    icon: Package,
    textColor: 'text-[#756046]' // Muted brown
  }
};

export function OrdersBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef(null);
  const router = useRouter();

  // Date Filter State
  const [dateFilter, setDateFilter] = useState({
    from: undefined,
    to: undefined,
  });


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
    const rawColumns = {
        pending: [],
        preparing: [],
        ready: [],
        completed: []
    };

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        let includeOrder = true;

        if (dateFilter?.from) {
            if (dateFilter.to) {
                includeOrder = orderDate >= startOfDay(dateFilter.from) && orderDate <= endOfDay(dateFilter.to);
            } else {
                includeOrder = isSameDay(orderDate, dateFilter.from);
            }
        } else {
            // Default behavior: active always shown, completed only today
            if (order.status === 'completed') {
                includeOrder = isSameDay(orderDate, new Date());
            }
        }

        if (includeOrder && rawColumns[order.status]) {
            rawColumns[order.status].push(order);
        }
    });

    for (const key in rawColumns) {
        rawColumns[key].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return rawColumns;
  };

  const columns = getColumns();

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F5F5F5] text-[#402E24]">Cargando panel...</div>;

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F5] overflow-hidden font-sans">
        {/* Header Consistente */}
        <div className="bg-[#402E24] shadow-md flex items-center px-4 py-4 sm:h-16 justify-between shrink-0 z-10 w-full flex-wrap gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.push('/menu')}
                    className="text-[#F5F5F5] hover:bg-white/10 hover:text-white transition-colors shrink-0"
                >
                    <ArrowLeft />
                </Button>
                <div className="min-w-0">
                     <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide truncate">Panel de Órdenes</h1>
                     <p className="text-xs text-gray-300 truncate">Gestión de cocina en tiempo real</p>
                </div>
            </div>

            <div className="flex items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-[260px] justify-start text-left font-normal bg-white/10 border-none text-white hover:bg-white/20 hover:text-white ${
                                !dateFilter?.from && "text-white/70"
                            }`}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter?.from ? (
                                dateFilter.to ? (
                                    <>
                                        {format(dateFilter.from, "LLL dd, y", { locale: es })} -{" "}
                                        {format(dateFilter.to, "LLL dd, y", { locale: es })}
                                    </>
                                ) : (
                                    format(dateFilter.from, "LLL dd, y", { locale: es })
                                )
                            ) : (
                                <span>Filtrar por fecha</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateFilter?.from}
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            numberOfMonths={1}
                            locale={es}
                        />
                         {dateFilter?.from && (
                             <div className="p-3 border-t border-gray-100 flex justify-end">
                                 <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     onClick={() => setDateFilter({ from: undefined, to: undefined })}
                                     className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                     Limpiar Filtro
                                 </Button>
                             </div>
                         )}
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        {/* Desktop View: Grid */}
        <div className="hidden lg:grid flex-1 grid-cols-4 gap-6 min-h-0 p-6">
            {Object.keys(COLUMN_CONFIG).map(status => {
                const config = COLUMN_CONFIG[status];
                const Icon = config.icon;
                const columnOrders = columns[status] || [];

                return (
                    <div key={status} className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className={`p-4 border-b border-gray-100 flex items-center justify-between shrink-0 ${config.color}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white/50 backdrop-blur-sm`}>
                                    <Icon size={20} className={config.textColor} />
                                </div>
                                <h2 className={`font-bold text-lg ${config.textColor}`}>
                                    {config.title}
                                    {status === 'completed' && (
                                        <span className="text-sm font-normal ml-2 opacity-80 capitalize">
                                            {dateFilter?.from ? (dateFilter.to && !isSameDay(dateFilter.from, dateFilter.to) ? `${format(dateFilter.from, "d 'de' MMMM 'de' yyyy", {locale: es})} - ${format(dateFilter.to, "d 'de' MMMM 'de' yyyy", {locale: es})}` : format(dateFilter.from, "d 'de' MMMM 'de' yyyy", {locale: es})) : format(new Date(), "d 'de' MMMM 'de' yyyy", {locale: es})}
                                        </span>
                                    )}
                                </h2>
                            </div>
                            <span className="bg-white px-2.5 py-0.5 rounded-full text-sm font-bold text-gray-600 shadow-sm border border-gray-100">
                                {columnOrders.length}
                            </span>
                        </div>
                        
                        <ScrollArea className="flex-1 min-h-0 bg-[#FAFAFA]">
                            <div className="p-4 relative space-y-4">
                                {columnOrders.map(order => (
                                    <OrderCard 
                                        key={order._id} 
                                        order={order} 
                                        status={status}
                                        onUpdateStatus={updateStatus}
                                        onDelete={() => handleDeleteClick(order)}
                                        onEdit={() => handleEditClick(order)}
                                    />
                                ))}
                                {columnOrders.length === 0 && (
                                    <div className="text-center text-gray-400 py-10">
                                        Sin órdenes en esta columna
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                );
            })}
        </div>

        {/* Mobile View: Tabs */}
        <div className="flex lg:hidden flex-1 min-h-0 p-3 sm:p-4">
            <Tabs defaultValue="pending" className="flex flex-col flex-1 w-full h-full min-h-0">
                <TabsList className="w-full bg-gray-100 border border-gray-200 p-1 mb-4 h-auto flex gap-1 sm:gap-2 shadow-inner rounded-xl overflow-x-auto no-scrollbar justify-start items-center">
                    {Object.keys(COLUMN_CONFIG).map(status => {
                        const config = COLUMN_CONFIG[status];
                        const Icon = config.icon;
                        const matchCount = (columns[status]?.length || 0);
                        return (
                            <TabsTrigger 
                                key={status} 
                                value={status}
                                className="shrink-0 py-2 px-2 sm:px-3 flex flex-col items-center gap-1 rounded-lg transition-all duration-300 data-[state=active]:bg-[#402E24] data-[state=active]:shadow-md data-[state=active]:text-white text-gray-500 hover:text-gray-700"
                            >
                                <div className="flex items-center gap-1.5 relative">
                                  <Icon size={14} className="shrink-0" />
                                  <span className="truncate text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                                      {config.title}
                                      {status === 'completed' && (
                                        <span className="opacity-80 normal-case ml-1">
                                            ({dateFilter?.from ? (dateFilter.to && !isSameDay(dateFilter.from, dateFilter.to) ? `${format(dateFilter.from, "dd/MM/yyyy")} - ${format(dateFilter.to, "dd/MM/yyyy")}` : format(dateFilter.from, "dd/MM/yyyy")) : format(new Date(), "dd/MM/yyyy")})
                                        </span>
                                      )}
                                  </span>
                                  {matchCount > 0 && (
                                      <span className="ml-1 bg-[#F0E0CD] text-[#402E24] px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm">
                                          {matchCount}
                                      </span>
                                  )}
                                </div>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {Object.keys(COLUMN_CONFIG).map(status => {
                    const config = COLUMN_CONFIG[status];
                    const columnOrders = columns[status] || [];
                    return (
                        <TabsContent key={status} value={status} className="flex-1 min-h-0 m-0 outline-none flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className={`p-3 border-b border-gray-100 shrink-0 ${config.color}`}>
                                <h3 className={`font-bold text-center flex items-center justify-center gap-2 ${config.textColor}`}>
                                    <span>
                                        {config.title}
                                        {status === 'completed' && (
                                            <span className="text-sm font-normal ml-2 opacity-80 capitalize">
                                                {dateFilter?.from ? (dateFilter.to && !isSameDay(dateFilter.from, dateFilter.to) ? `${format(dateFilter.from, "d 'de' MMMM 'de' yyyy", {locale: es})} - ${format(dateFilter.to, "d 'de' MMMM 'de' yyyy", {locale: es})}` : format(dateFilter.from, "d 'de' MMMM 'de' yyyy", {locale: es})) : format(new Date(), "d 'de' MMMM 'de' yyyy", {locale: es})}
                                            </span>
                                        )}
                                    </span>
                                    <span>({columnOrders.length})</span>
                                </h3>
                            </div>
                            <ScrollArea className="flex-1 min-h-0 bg-[#FAFAFA]">
                                <div className="p-4 relative space-y-4">
                                    {columnOrders.map(order => (
                                        <OrderCard 
                                            key={order._id} 
                                            order={order} 
                                            status={status}
                                            onUpdateStatus={updateStatus}
                                            onDelete={() => handleDeleteClick(order)}
                                            onEdit={() => handleEditClick(order)}
                                        />
                                    ))}
                                    {columnOrders.length === 0 && (
                                        <div className="text-center text-gray-400 py-10">
                                            Sin órdenes en esta columna
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    );
                })}
            </Tabs>
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


// ... (EditOrderModal remains unchanged)

function OrderCard({ order, status, onUpdateStatus, onDelete, onEdit }) {
    // Determine card styling based on status
    const isNew = status === 'pending';
    const isPreparing = status === 'preparing';
    const config = COLUMN_CONFIG[status];
    
    return (
        <Card className={`group relative transition-all duration-300 border-none shadow-sm hover:shadow-md overflow-hidden ${isNew ? `ring-2 ${config.borderColor}` : ''}`}>
             {/* Status indicator strip */}
             <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${config.color.replace('bg-', 'bg-').replace('100', '300')}`}></div>

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
                    className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-none shadow-xl rounded-xl overflow-hidden" 
                    align="start" 
                    sideOffset={5}
                >
                    <div className="bg-[#402E24] px-4 py-3 text-white flex justify-between items-center">
                         <span className="font-bold">Orden #{order.orderNumber}</span>
                         <span className="text-white/80 text-sm">Detalle completo</span>
                    </div>
                    <ScrollArea className="max-h-[320px] h-auto bg-[#FAFAFA]">
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
                                        {item.size && <div>Tamaño: <div className="text-xs text-gray-500 bg-white inline-block px-1.5 rounded border border-gray-100 mr-1">{item.size.label}</div></div>}
                                        {item.flavors?.length > 0 && (
                                            <div className="text-xs text-gray-500 flex flex-wrap gap-1">
                                                Sabor: {item.flavors.map((f, i) => (
                                                    <span key={i} className="font-medium bg-white inline-block px-1.5 rounded border border-gray-100 mr-1">
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
                            className="w-full h-9 bg-[#A67C52] hover:bg-[#8A623A] text-white shadow-sm font-medium transition-all active:scale-95" 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, 'preparing'); }}
                        >
                            Comenzar Preparación
                        </Button>
                    )}
                    {status === 'preparing' && (
                        <Button 
                            className="w-full h-9 bg-[#8A623A] hover:bg-[#6A4725] text-white shadow-sm font-medium transition-all active:scale-95 animate-pulse hover:animate-none" 
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

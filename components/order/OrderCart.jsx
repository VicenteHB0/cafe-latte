"use client";

import { ShoppingCart, Trash2, Minus, CreditCard, Banknote } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function OrderCart({
  orderItems,
  nextOrderNumber,
  paymentMethod,
  setPaymentMethod,
  removeFromOrder,
  placeOrder,
  calculateTotal,
  animateTotal
}) {
  return (
    <div className="flex flex-col h-full bg-white shadow-2xl z-10 overflow-hidden">
        <div className="p-4 border-b border-[#A67C52] bg-[#F0E0CD] shrink-0">
            <h2 className="font-bold text-[#402E24] text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Detalle del Pedido
            </h2>
            <div className="mt-2">
                <span className="text-3xl font-bold text-[#756046]">
                    Orden #{nextOrderNumber || '-'}
                </span>
            </div>
        </div>

        {/* Order Items List */}
        <ScrollArea className="flex-1 min-h-0 bg-white">
            <div className="p-4 space-y-3">
                {orderItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#B68847] opacity-50 py-10">
                        <ShoppingCart className="w-16 h-16 mb-2" />
                        <p>Orden vacía</p>
                    </div>
                ) : (
                    orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-2 hover:bg-[#f9f9f9] rounded-lg group">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#402E24]">{item.quantity}x</span>
                                    <span className="font-medium text-[#402E24]">{item.name}</span>
                                </div>
                                {item.size && <div className="text-xs text-[#756046] ml-6">Tamaño: {item.size.label}</div>}
                                {item.flavors?.length > 0 && <div className="text-xs text-[#756046] ml-6">Sabor: {item.flavors.join(', ')}</div>}
                                {item.sauces?.length > 0 && <div className="text-xs text-[#756046] ml-6">Salsas: {item.sauces.join(', ')}</div>}
                                {item.extras?.map((extra, idx) => (
                                    <div key={idx} className="text-xs text-[#756046] ml-6">+ {extra.name}</div>
                                ))}
                                {item.customizations?.map((note, idx) => (
                                    <div key={idx} className="text-xs text-[#A67C52] italic ml-6">"{note}"</div>
                                ))}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="font-bold text-[#402E24]">${item.price * item.quantity}</span>
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
        <div className="p-4 bg-[#F0E0CD] border-t border-[#A67C52] space-y-4 shrink-0">
            <div className="flex justify-between items-center text-sm text-[#756046]">
                <span>Artículos</span>
                <span>{orderItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-[#402E24]">
                <span>Total</span>
                <span className={`transition-transform duration-300 ${animateTotal ? 'scale-125 text-[#A67C52]' : 'scale-100'}`}>
                    ${calculateTotal()}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <Button 
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full ${paymentMethod === 'cash' ? 'bg-[#402E24]' : 'border-[#402E24] text-[#402E24]'}`}
                    size="sm"
                >
                    <Banknote className="w-4 h-4 mr-2" /> Efectivo
                </Button>
                <Button 
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full ${paymentMethod === 'card' ? 'bg-[#402E24]' : 'border-[#402E24] text-[#402E24]'}`}
                    size="sm"
                >
                    <CreditCard className="w-4 h-4 mr-2" /> Tarjeta
                </Button>
            </div>

            <Button 
                className="w-full bg-[#402E24] hover:bg-[#2b1f18] text-white h-12 text-lg"
                disabled={orderItems.length === 0}
                onClick={placeOrder}
            >
                Confirmar Orden
            </Button>
        </div>
    </div>
  );
}

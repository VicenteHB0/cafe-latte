"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // Import toast

export function AddToOrderDialog({ open, onOpenChange, product, onAddToOrder, initialItem = null }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState(null); 
  const [selectedSauce, setSelectedSauce] = useState(null); // Changed to single value
  const [notes, setNotes] = useState('');

  // Reset state when product changes or dialog opens
  useEffect(() => {
    if (open && product) {
        if (initialItem) {
            // Edit Mode: Hydrate from existing item
            setQuantity(initialItem.quantity || 1);
            setSelectedSize(initialItem.size || (product.sizes?.length > 0 ? product.sizes[0] : null));
            setSelectedExtras(initialItem.extras || []);
            setSelectedFlavor(initialItem.flavors?.[0] || null);
            setSelectedSauce(initialItem.sauces?.[0] || null);
            setNotes(initialItem.customizations?.[0] || '');
        } else {
            // Add Mode: Reset
            setQuantity(1);
            // Default to first size if available, otherwise null (standard price)
            setSelectedSize(product.sizes?.length > 0 ? product.sizes[0] : null);
            setSelectedExtras([]);
            setSelectedFlavor(null);
            setSelectedSauce(null);
            setNotes('');
        }
    }
  }, [open, product, initialItem]);

  if (!product) return null;

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const toggleExtra = (extra) => {
    setSelectedExtras(current => {
      const exists = current.find(e => e.name === extra.name);
      if (exists) {
        return current.filter(e => e.name !== extra.name);
      } else {
        return [...current, extra];
      }
    });
  };

  // No longer needed as toggleSauce is replaced by direct setter or simple handler for single select
  const handleSauceSelect = (sauce) => {
    setSelectedSauce(sauce);
  };

  const calculateItemTotal = () => {
    let price = (selectedSize ? selectedSize.price : product.price) || 0;
    selectedExtras.forEach(extra => {
      price += extra.price;
    });
    if (selectedFlavor && selectedFlavor.price) {
         price += selectedFlavor.price;
    }
    return price * quantity;
  };

  const handleConfirm = () => {
    // Validation
    if (product.flavors && product.flavors.length > 0 && !selectedFlavor) {
        toast.error("Por favor selecciona un sabor."); 
        return;
    }

    if (product.options?.sauces && product.options.sauces.length > 0 && !selectedSauce) {
        toast.error("Por favor selecciona una salsa.");
        return;
    }

    const orderItem = {
      product: product._id,
      name: product.name,
      quantity,
      price: calculateItemTotal() / quantity, // Unit price with modifiers
      size: selectedSize,
      extras: selectedExtras,
      flavors: selectedFlavor ? [selectedFlavor] : [],
      sauces: selectedSauce ? [selectedSauce] : [],
      customizations: notes ? [notes] : [],
    };
    onAddToOrder(orderItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-2 border-b border-gray-100 bg-[#FAFAFA]">
            <DialogTitle className="text-2xl text-[#402E24] font-serif tracking-tight">
                {initialItem ? `Editar: ${product.name}` : product.name}
            </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-[#402E24] text-sm font-bold uppercase tracking-wider">Tamaño</Label>
                    <RadioGroup 
                        value={selectedSize?.label} 
                        onValueChange={(val) => setSelectedSize(product.sizes.find(s => s.label === val))}
                        className="grid grid-cols-3 gap-3"
                    >
                        {product.sizes.map((size) => (
                            <div key={size.label}>
                                <RadioGroupItem value={size.label} id={`size-${size.label}`} className="peer sr-only" />
                                <Label 
                                    htmlFor={`size-${size.label}`} 
                                    className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 bg-white p-3 hover:bg-[#F5F5F5] hover:border-[#A67C52]/50 peer-data-[state=checked]:border-[#402E24] peer-data-[state=checked]:bg-[#402E24] peer-data-[state=checked]:text-white cursor-pointer transition-all duration-200 text-center h-full shadow-sm peer-data-[state=checked]:shadow-md"
                                >
                                    <span className="font-bold text-sm">{size.label}</span>
                                    <span className="text-xs opacity-80 mt-1">${size.price}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            )}

            {/* Extras */}
            {product.extras && product.extras.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-[#402E24] text-sm font-bold uppercase tracking-wider">Extras</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {product.extras.map((extra) => {
                            const isSelected = selectedExtras.some(e => e.name === extra.name);
                            return (
                                <div 
                                    key={extra.name}
                                    onClick={() => toggleExtra(extra)}
                                    className={`
                                        cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 flex justify-between items-center shadow-sm
                                        ${isSelected 
                                            ? 'border-[#402E24] bg-[#402E24] text-white shadow-md' 
                                            : 'border-gray-100 bg-white hover:bg-[#F5F5F5] hover:border-[#A67C52]/50 text-gray-600'}
                                    `}
                                >
                                    <span className="font-medium text-sm">{extra.name}</span>
                                    <span className="text-xs opacity-90 font-bold">+${extra.price}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

             {/* Flavors */}
             {product.flavors && product.flavors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-[#402E24] text-sm font-bold uppercase tracking-wider">Sabor <span className="text-red-500">*</span></Label>
          <RadioGroup
            value={selectedFlavor?.name}
            onValueChange={(val) => setSelectedFlavor(product.flavors.find(f => f.name === val))}
            className="grid grid-cols-2 gap-3"
          >
            {product.flavors.map((flavor) => (
              <div key={flavor.name}>
                <RadioGroupItem
                  value={flavor.name}
                  id={`flavor-${flavor.name}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`flavor-${flavor.name}`}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 bg-white p-3 hover:bg-[#F5F5F5] hover:border-[#A67C52]/50 peer-data-[state=checked]:border-[#402E24] peer-data-[state=checked]:bg-[#402E24] peer-data-[state=checked]:text-white cursor-pointer transition-all duration-200 text-center h-full shadow-sm"
                >
                  <span className="font-medium text-sm">{flavor.name}</span>
                  {flavor.price > 0 && <span className="text-xs opacity-80 mt-1">+${flavor.price}</span>}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
            )}

            {/* Sauces */}
            {product.options?.sauces && product.options.sauces.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-[#402E24] text-sm font-bold uppercase tracking-wider">Salsas <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                        {product.options.sauces.map((sauce) => {
                            const isSelected = selectedSauce === sauce;
                            return (
                                <div 
                                    key={sauce}
                                    onClick={() => handleSauceSelect(sauce)}
                                    className={`
                                        cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 text-center shadow-sm
                                        ${isSelected 
                                            ? 'border-[#402E24] bg-[#402E24] text-white shadow-md' 
                                            : 'border-gray-100 bg-white hover:bg-[#F5F5F5] hover:border-[#A67C52]/50 text-gray-600'}
                                    `}
                                >
                                    <span className="font-medium text-sm">{sauce}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="space-y-3">
                <Label htmlFor="notes" className="text-[#402E24] text-sm font-bold uppercase tracking-wider">Notas de preparación</Label>
                <Textarea 
                    id="notes" 
                    placeholder="Escribe aquí instrucciones especiales..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-gray-200 focus-visible:ring-[#402E24] bg-gray-50/50 min-h-[80px]"
                />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-center space-x-6 py-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(-1)}
                    className="h-12 w-12 rounded-full border-2 border-gray-200 text-gray-600 hover:border-[#402E24] hover:text-[#402E24] transition-colors"
                >
                    <span className="text-xl font-bold mb-1">-</span>
                </Button>
                <span className="text-3xl font-bold text-[#402E24] w-12 text-center font-serif">{quantity}</span>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(1)}
                    className="h-12 w-12 rounded-full border-2 border-gray-200 text-gray-600 hover:border-[#402E24] hover:text-[#402E24] transition-colors"
                >
                    <span className="text-xl font-bold mb-1">+</span>
                </Button>
            </div>
        </div>

        <DialogFooter className="p-6 bg-[#FAFAFA] border-t border-gray-100 flex-col sm:flex-row gap-3 items-center">
             <div className="text-xl font-bold text-[#402E24] mr-auto">
                Total: <span className="text-2xl">${calculateItemTotal()}</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none text-gray-500 hover:text-[#402E24]">
                    Cancelar
                </Button>
                <Button onClick={handleConfirm} className="flex-1 sm:flex-none bg-[#402E24] text-white hover:bg-[#2b1f18] h-11 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95">
                    {initialItem ? "Actualizar" : "Agregar"}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

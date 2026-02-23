import { useState, useEffect } from 'react';
import { Plus, X, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCard } from './ProductCard';

export function ProductFormDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Café',
    description: '',
    price: undefined,
    image: '',

    available: true,
    extras: [],
    sizes: [],
    flavors: [],
    extraFlavorPrice: undefined,
    options: undefined
  });

  // Estados para inputs temporales
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [extraAllowQuantity, setExtraAllowQuantity] = useState(false);
  const [sizeLabel, setSizeLabel] = useState('');
  const [sizePrice, setSizePrice] = useState('');
  const [flavorName, setFlavorName] = useState('');
  const [flavorPrice, setFlavorPrice] = useState('');
  const [sauceName, setSauceName] = useState('');

  // Preview Product Object
  const [previewProduct, setPreviewProduct] = useState({});

  // Dynamic Categories
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, [open]); // Refresh categories when dialog opens

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setDbCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const dynamicCategories = dbCategories.length > 0 
    ? dbCategories.map(c => c.name) 
    : ['Café', 'Té', 'Bebida Fría', 'Comida', 'Postre', 'Otro']; // Fallback inicial

  // Cargar datos iniciales si existen (Modo Edición)
  useEffect(() => {
    if (open) {
        if (initialData) {
            // Convertir sabores antiguos (strings) al nuevo formato (objetos)
            const safeFlavors = (initialData.flavors || []).map(f => {
                if (typeof f === 'string') {
                    return { name: f, price: initialData.extraFlavorPrice || 0 };
                }
                return f;
            });

            setFormData({
                name: initialData.name || '',
                category: initialData.category || 'Café',
                description: initialData.description || '',
                price: initialData.price || undefined,
                available: initialData.available ?? true,
                extras: initialData.extras || [],
                sizes: initialData.sizes || [],
                flavors: safeFlavors,
                options: initialData.options || undefined,
                image: initialData.image || '',
            });
        } else {
            // Resetear si es nuevo producto
            setFormData({
                name: '',
                category: 'Café',
                description: '',
                price: undefined,
                image: '',

                available: true,
                extras: [],
                sizes: [],
                flavors: [],
                options: undefined
            });
        }
    }
  }, [initialData, open]);

  useEffect(() => {
    setPreviewProduct({
        _id: initialData?._id || 'preview',
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
    });
  }, [formData, initialData]);

  const enforcePriceRules = (e) => {
      let val = e.target.value;
      if (val.startsWith('-')) {
          e.target.value = val.replace('-', '');
          val = e.target.value;
      }
      if (val.includes('.')) {
          const parts = val.split('.');
          if (parts[1].length > 2) {
              e.target.value = `${parts[0]}.${parts[1].slice(0, 2)}`;
          }
      }
  };

  const preventInvalidKeys = (e) => {
      if (['-', '+', 'e', 'E'].includes(e.key)) {
          e.preventDefault();
      }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpiar datos según categoría
    const cleanedData = {
      name: formData.name || '',
      category: formData.category || 'Café',
      description: formData.description || '',
      image: formData.image || '',
      available: formData.available ?? true,
    };

    // Agregar campos de arreglos siempre (incluso vacíos) para que MongoDB pueda sobrescribirlos y borrarlos
    if (formData.price !== undefined && formData.price !== '' && formData.price !== null) cleanedData.price = formData.price;
    cleanedData.extras = formData.extras || [];
    cleanedData.sizes = formData.sizes || [];
    cleanedData.flavors = formData.flavors || [];
    
    if (formData.options) cleanedData.options = formData.options;

    // Si es edición, mantenemos el ID
    if (initialData?._id) {
        cleanedData._id = initialData._id;
    }

    onSubmit(cleanedData);
    onOpenChange(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("La imagen es demasiado grande. El tamaño máximo es 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
  };

  const addExtra = () => {
    if (extraName && extraPrice) {
      setFormData({
        ...formData,
        extras: [...(formData.extras || []), { name: extraName, price: parseFloat(extraPrice), allowQuantity: extraAllowQuantity }]
      });
      setExtraName('');
      setExtraPrice('');
      setExtraAllowQuantity(false);
    }
  };

  const removeExtra = (index) => {
    setFormData({
      ...formData,
      extras: formData.extras?.filter((_, i) => i !== index)
    });
  };

  const addSize = () => {
    if (sizeLabel && sizePrice) {
      setFormData({
        ...formData,
        sizes: [...(formData.sizes || []), { label: sizeLabel, price: parseFloat(sizePrice) }]
      });
      setSizeLabel('');
      setSizePrice('');
    }
  };

  const removeSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes?.filter((_, i) => i !== index)
    });
  };

  const addFlavor = () => {
    if (flavorName) {
      setFormData({
        ...formData,
        flavors: [...(formData.flavors || []), { name: flavorName, price: flavorPrice ? parseFloat(flavorPrice) : 0 }]
      });
      setFlavorName('');
      setFlavorPrice('');
    }
  };

  const removeFlavor = (index) => {
    setFormData({
      ...formData,
      flavors: formData.flavors?.filter((_, i) => i !== index)
    });
  };

  const addSauce = () => {
    if (sauceName) {
      setFormData({
        ...formData,
        options: {
          ...formData.options,
          sauces: [...(formData.options?.sauces || []), sauceName]
        }
      });
      setSauceName('');
    }
  };

  const removeSauce = (index) => {
    setFormData({
      ...formData,
      options: {
        ...formData.options,
        sauces: formData.options?.sauces?.filter((_, i) => i !== index)
      }
    });
  };

  return (

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-7xl w-full h-[90vh] flex flex-col p-0 gap-0 bg-white border-none shadow-2xl overflow-hidden"
        >
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-white">
            <DialogTitle className="text-2xl font-bold text-[#402E24] tracking-tight">
                {initialData ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
                {initialData ? 'Modifica los detalles del producto.' : 'Completa los detalles para añadir un nuevo producto al menú.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              <div className="flex-1 h-full min-w-0">
                <ScrollArea className="h-full">
                    <div className="p-6 pt-6">
                        <form id="product-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
                        {/* Información básica */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 bg-[#402E24] rounded-full"></div>
                                <h3 className="font-bold text-gray-800 text-lg">Información General</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-700 font-medium">Nombre del Producto *</Label>
                                    <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50"
                                    placeholder="Ej: Latte Vainilla"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-gray-700 font-medium">Categoría *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger className="border-gray-200 bg-gray-50/50 focus:ring-[#402E24]/10">
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dynamicCategories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2 flex flex-col">
                                    <Label htmlFor="description" className="text-gray-700 font-medium">Descripción (Opcional)</Label>
                                    <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="flex-1 border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50 resize-none min-h-[120px]"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-gray-700 font-medium">Imagen (Opcional)</Label>
                                    {formData.image ? (
                                        <div className="relative w-full h-full min-h-[120px] max-h-[120px] rounded-xl border border-gray-200 overflow-hidden bg-white flex items-center justify-center group shadow-sm">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="gap-2 shadow-xl">
                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full min-h-[120px] max-h-[120px] rounded-xl border-2 border-dashed border-gray-300 hover:border-[#A67C52] bg-gray-50/50 hover:bg-[#F0E0CD]/10 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                onChange={handleImageUpload}
                                            />
                                            <div className="flex flex-col items-center space-y-1 text-gray-500 group-hover:text-[#A67C52] transition-colors transform group-hover:scale-105 duration-300 p-2">
                                                <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                                    <ImagePlus className="w-5 h-5 text-[#A67C52]" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-xs font-bold block">Clic para subir imagen</span>
                                                    <span className="text-[10px] text-gray-400">PNG, JPG h/5MB</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-gray-700 font-medium">Precio Base ($)</Label>
                                    <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price || ''}
                                    onKeyDown={preventInvalidKeys}
                                    onInput={enforcePriceRules}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    placeholder="0.00"
                                    className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50"
                                    />
                                    <p className="text-xs text-gray-400">Dejar vacío si el precio depende del tamaño.</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* Tamaños */}
                        <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 bg-[#A67C52] rounded-full"></div>
                                <h3 className="font-bold text-gray-800 text-lg">Tamaños y Precios</h3>
                            </div>

                            <div className="flex gap-3 items-end p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase">Etiqueta</Label>
                                    <Input
                                        value={sizeLabel}
                                        onChange={(e) => setSizeLabel(e.target.value)}
                                        placeholder="Ej: Grande"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase">Precio</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={sizePrice}
                                        onKeyDown={preventInvalidKeys}
                                        onInput={enforcePriceRules}
                                        onChange={(e) => setSizePrice(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <Button type="button" onClick={addSize} className="bg-[#402E24] hover:bg-[#2b1f18] text-white">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>

                            {formData.sizes && formData.sizes.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {formData.sizes.map((size, idx) => (
                                <div key={idx} className="flex justify-between items-center px-4 py-3 rounded-lg bg-white border border-gray-100 shadow-sm relative group">
                                    <div>
                                        <div className="font-bold text-gray-800">{size.label}</div>
                                        <div className="text-sm text-[#A67C52]">${size.price}</div>
                                    </div>
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSize(idx)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                    <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* Extras y Personalización */}
                        <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 bg-[#A67C52] rounded-full"></div>
                                <h3 className="font-bold text-gray-800 text-lg">Personalización</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Extras */}
                                <div className="space-y-3">
                                    <Label className="text-gray-700 font-medium">Extras Disponibles</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={extraName}
                                            onChange={(e) => setExtraName(e.target.value)}
                                            placeholder="Nombre"
                                            className="flex-1 bg-gray-50 border-gray-200"
                                        />
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={extraPrice}
                                            onKeyDown={preventInvalidKeys}
                                            onInput={enforcePriceRules}
                                            onChange={(e) => setExtraPrice(e.target.value)}
                                            placeholder="$"
                                            className="w-20 bg-gray-50 border-gray-200"
                                        />
                                        <div className="flex items-center gap-1.5 px-1">
                                            <Switch
                                                checked={extraAllowQuantity}
                                                onCheckedChange={setExtraAllowQuantity}
                                                className="data-[state=checked]:bg-[#402E24] scale-90"
                                            />
                                            <Label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">Múltiple</Label>
                                        </div>
                                        <Button type="button" onClick={addExtra} size="icon" className="bg-gray-200 hover:bg-gray-300 text-gray-700 shrink-0">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {formData.extras?.map((extra, idx) => (
                                            <div key={idx} className="flex justify-between items-center px-3 py-2 rounded bg-gray-50 text-sm">
                                                <span>{extra.name} (+${extra.price}) {extra.allowQuantity && <span className="text-[10px] font-bold text-[#A67C52] ml-1 uppercase">(xN)</span>}</span>
                                                <X className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-red-500" onClick={() => removeExtra(idx)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                    {/* Sabores */}
                                <div className="space-y-3 flex flex-col">
                                    <Label className="text-gray-700 font-medium">Sabores</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={flavorName}
                                            onChange={(e) => setFlavorName(e.target.value)}
                                            placeholder="Sabor"
                                            className="flex-1 bg-gray-50 border-gray-200"
                                        />
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={flavorPrice}
                                            onKeyDown={preventInvalidKeys}
                                            onInput={enforcePriceRules}
                                            onChange={(e) => setFlavorPrice(e.target.value)}
                                            placeholder="$"
                                            className="w-20 bg-gray-50 border-gray-200"
                                        />
                                        <Button type="button" onClick={addFlavor} size="icon" className="bg-gray-200 hover:bg-gray-300 text-gray-700 shrink-0">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {formData.flavors?.map((flavor, idx) => (
                                            <div key={idx} className="flex justify-between items-center px-3 py-2 rounded bg-gray-50 text-sm">
                                                <span>{flavor.name} {flavor.price > 0 && `(+$${flavor.price})`}</span>
                                                <X className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-red-500" onClick={() => removeFlavor(idx)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* Disponibilidad */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <Label htmlFor="available" className="text-base font-bold text-[#402E24]">Disponibilidad</Label>
                                <p className="text-sm text-gray-500">Activa o desactiva este producto del menú visible.</p>
                            </div>
                            <Switch
                                id="available"
                                checked={formData.available}
                                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                        </form>
                    </div>
                </ScrollArea>
              </div>

              {/* Preview Column */}
              <div className="bg-[#f8f9fa] border-l border-gray-100 hidden lg:flex flex-col h-full overflow-hidden w-[450px]">
                <div className="p-6 bg-white border-b border-gray-100">
                    <h4 className="text-[#402E24] font-bold">Vista Previa</h4>
                    <p className="text-xs text-gray-500">Así es como se verá el producto en el menú.</p>
                </div>
                <div className="flex-1 flex items-start justify-center p-8 pt-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-y-auto">
                    <div className="w-full max-w-sm transform transition-all duration-500 hover:scale-105">
                        <ProductCard
                            product={previewProduct}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            hideActions={true}
                        />
                    </div>
                </div>
              </div>
          </div>

           <DialogFooter className="p-5 bg-white border-t border-gray-100 gap-3">
             <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50">
               Cancelar
             </Button>
             <Button type="submit" form="product-form" className="bg-[#402E24] hover:bg-[#2b1f18] text-white px-8 shadow-lg">
               {initialData ? 'Guardar Cambios' : 'Crear Producto'}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
  );

}

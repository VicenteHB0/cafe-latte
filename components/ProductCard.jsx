import { Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product, onEdit, onDelete, hideActions }) {
  return (

    <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-white rounded-xl flex flex-col h-full">
      {/* Imagen */}
      {product.image ? (
        <div className="w-full h-48 overflow-hidden relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
        </div>
      ) : (
        <div className="h-2 bg-[#402E24] w-full" />
      )}


      <CardHeader className="p-5 pb-2">
            <div className="flex justify-between items-start gap-2">
                <div>
                     <CardDescription className="text-xs text-[#A67C52] font-bold uppercase tracking-wider mb-1">
                        {product.category}
                    </CardDescription>
                    <CardTitle className="text-xl font-bold text-[#402E24] leading-tight group-hover:text-[#A67C52] transition-colors">
                        {product.name}
                    </CardTitle>
                </div>
                 {product.price && (
                    <div className="text-xl font-bold text-[#402E24] bg-gray-50 px-2 py-1 rounded-lg">
                    ${product.price}
                    </div>
                )}
            </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 flex-grow space-y-4">
        {/* Descripción */}
        <p className="text-sm text-gray-500 line-clamp-2">
          {product.description || "Sin descripción"}
        </p>

        {/* Detalles colapsables o resumen */}
        <div className="space-y-3 pt-2">
             {/* Tamaños */}
            {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tamaños</p>
                <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 font-normal">
                    {size.label}: <span className="font-semibold ml-1">${size.price}</span>
                    </Badge>
                ))}
                </div>
            </div>
            )}

            {/* Sabores/Extras Preview */}
            {(product.flavors?.length > 0 || product.extras?.length > 0) && (
                 <div className="flex gap-2 text-xs text-gray-400">
                    {product.flavors?.length > 0 && <span>• {product.flavors.length} Sabores</span>}
                    {product.extras?.length > 0 && <span>• {product.extras.length} Extras</span>}
                 </div>
            )}
        </div>
      </CardContent>

      {!hideActions && (
        <CardFooter className="p-4 bg-gray-50 border-t border-gray-100 gap-3 mt-auto">
            <Button
              onClick={() => onEdit?.(product)}
              variant="outline"
              className="flex-1 border-gray-200 text-gray-700 hover:text-[#402E24] hover:border-[#402E24] hover:bg-white transition-all shadow-sm"
              size="sm"
            >
              <Edit2 className="w-3.5 h-3.5 mr-2" />
              Editar
            </Button>
            <Button
              onClick={() => onDelete?.(product._id || '')}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors h-9 w-9"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
        </CardFooter>
      )}
    </Card>
  );

}

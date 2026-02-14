import { Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product, onEdit, onDelete, hideActions }) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-[#A67C52] hover:shadow-xl transition-all">
      {/* Imagen */}
      <div 
        className="h-48 flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #F0E0CD 0%, #A67C52 100%)'
        }}
      >
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">☕</div>
        )}
      </div>

      <CardHeader className="p-5 pb-2">
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-lg font-bold text-[#402E24]" style={{ fontFamily: 'var(--font-body)' }}>
                    {product.name}
                </CardTitle>
                <CardDescription className="text-xs text-[#756046]">
                    {product.category}
                </CardDescription>
            </div>
            <Badge variant={product.available ? "default" : "destructive"} className={product.available ? "bg-[#d4edda] text-[#155724] hover:bg-[#d4edda]/80" : "bg-[#f8d7da] text-[#721c24] hover:bg-[#f8d7da]/80"}>
                {product.available ? 'Disponible' : 'No disponible'}
            </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-3">
        {/* Descripción */}
        <p className="text-sm text-[#756046]">
          {product.description}
        </p>

        {/* Precio base */}
        {product.price && (
            <div className="text-2xl font-bold text-[#402E24]">
              ${product.price}
            </div>
        )}

        {/* Tamaños */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2 text-[#756046]">
              Tamaños:
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-[#F0E0CD] text-[#402E24] border-none">
                  {size.label}: ${size.price}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Extras */}
        {product.extras && product.extras.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2 text-[#756046]">
              Extras disponibles:
            </p>
            <div className="space-y-1">
              {product.extras.map((extra, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-xs px-2 py-1 rounded bg-[#F0E0CD]"
                >
                  <span className="text-[#402E24]">{extra.name}</span>
                  <span className="text-[#A67C52]">+${extra.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sabores */}
        {product.flavors && product.flavors.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2 text-[#756046]">
              Sabores:
            </p>
            <div className="flex gap-1 flex-wrap">
              {product.flavors.map((flavor, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-[#F0E0CD] text-[#402E24]">
                  {flavor}
                </Badge>
              ))}
            </div>
            {product.extraFlavorPrice && (
              <p className="text-xs mt-1 text-[#A67C52]">
                Sabor extra: +${product.extraFlavorPrice}
              </p>
            )}
          </div>
        )}

        {/* Opciones */}
        {product.options && (
          <div>
            <p className="text-xs font-semibold mb-2 text-[#756046]">
              Opciones:
            </p>
            {product.options.pieces && (
              <p className="text-xs mb-1 text-[#402E24]">
                Piezas: {product.options.pieces}
              </p>
            )}
            {product.options.sauces && product.options.sauces.length > 0 && (
              <div>
                <p className="text-xs mb-1 text-[#756046]">Salsas:</p>
                <div className="flex gap-1 flex-wrap">
                  {product.options.sauces.map((sauce, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-[#F0E0CD] text-[#402E24]">
                      {sauce}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {!hideActions && (
        <CardFooter className="p-5 pt-0 flex gap-2">
            <Button
              onClick={() => onEdit?.(product)}
              className="flex-1 bg-[#B68847] hover:bg-[#B68847]/90 text-white"
              size="sm"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              onClick={() => onDelete?.(product._id || '')}
              variant="destructive"
              size="icon"
              className="bg-[#d32f2f] hover:bg-[#d32f2f]/90"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}

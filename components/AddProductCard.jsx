import { Plus } from 'lucide-react';

export function AddProductCard({ onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-center min-h-[400px] border-l-4 border-l-[#a0826d] border-dashed"
    >
      <div className="text-center p-8">
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#f5f1ed]"
        >
          <Plus className="w-8 h-8 text-[#a0826d]" />
        </div>
        <h3 className="text-lg mb-2 text-[#3d2817]">
          Añadir Producto
        </h3>
        <p className="text-sm text-[#8b7355]">
          Crear un nuevo producto
        </p>
      </div>
    </div>
  );
}

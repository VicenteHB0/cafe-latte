import { Plus } from 'lucide-react';

export function AddProductCard({ onClick }) {
  return (

    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer flex items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200 hover:border-[#402E24] group h-full"
    >
      <div className="text-center p-8">
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gray-50 group-hover:bg-[#402E24] transition-colors duration-300"
        >
          <Plus className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-gray-700 group-hover:text-[#402E24] transition-colors">
          Añadir Producto
        </h3>
        <p className="text-sm text-gray-400 group-hover:text-gray-500 transition-colors">
          Crear un nuevo producto
        </p>
      </div>
    </div>
  );

}

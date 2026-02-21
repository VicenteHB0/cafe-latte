import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectMongo();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();
    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'La categoría ya existe' }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    await connectMongo();

    // Find the category first to get its name for the check
    const category = await Category.findById(id);
    if (!category) {
       return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // Check if any product is using this category
    const productsUsingCategory = await Product.countDocuments({ category: category.name });
    
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${productsUsingCategory} producto(s) usando la categoría "${category.name}". Reasígnalos primero.` },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error al eliminar la categoría' }, { status: 500 });
  }
}

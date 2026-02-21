import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(product);
    }

    const products = await Product.find({});
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
    await dbConnect();
  
    try {
      const body = await request.json();
      const product = await Product.create(body);
      return NextResponse.json(product, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PUT(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const product = await Product.findByIdAndUpdate(_id, updateData, { new: true });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }
}

export async function DELETE(request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Calculate daily order number
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const count = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const orderNumber = count + 1;
    
    // Basic validation could go here, but Mongoose schema handles most
    const order = await Order.create({
        ...body,
        orderNumber,
        customerName: body.customerName || `Orden #${orderNumber}` // Fallback name
    });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const nextNumber = searchParams.get('nextNumber');

    if (nextNumber) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const count = await Order.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        
        return NextResponse.json({ nextNumber: count + 1 });
    }

    // Default sort by newest first
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error fetching orders' },
      { status: 500 }
    );
  }
}

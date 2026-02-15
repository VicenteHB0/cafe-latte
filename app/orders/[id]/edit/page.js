import { OrderInterface } from "@/components/OrderInterface";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { redirect } from "next/navigation";

export default async function EditOrderPage({ params }) {
  const { id } = await params;

  await dbConnect();
  const order = await Order.findById(id).lean();

  if (!order) {
    redirect('/orders/board');
  }

  // Convert _id and dates to strings for serialization
  const serializedOrder = {
    ...order,
    _id: order._id.toString(),
    createdAt: order.createdAt.toString(),
    updatedAt: order.updatedAt.toString(),
    items: order.items.map(item => ({
        ...item,
        // Ensure no Mongoose specific objects remain
    }))
  };

  return <OrderInterface initialOrder={serializedOrder} />;
}

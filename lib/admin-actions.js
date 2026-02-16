'use server';

import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  await connectDB();
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  // Convert _id to string to pass to client components if needed, or return plain objects
  return JSON.parse(JSON.stringify(users));
}

export async function createUser(formData) {
  await connectDB();

  const username = formData.get('username');
  const password = formData.get('password');
  const name = formData.get('name');
  const role = formData.get('role');

  if (!username || !password || !name || !role) {
    return { error: 'Todos los campos son obligatorios' };
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return { error: 'El nombre de usuario ya existe' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      name,
      role,
    });

    revalidatePath('/admin');
    return { success: 'Usuario creado exitosamente' };
  } catch (error) {
    console.error('Error creating user:', error);
    return { error: 'Error al crear el usuario' };
  }
}

export async function deleteUser(userId) {
  await connectDB();

  try {
    await User.findByIdAndDelete(userId);
    revalidatePath('/admin');
    return { success: 'Usuario eliminado' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Error al eliminar el usuario' };
  }
}

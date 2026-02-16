'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(prevState, formData) {
  try {
    const data = Object.fromEntries(formData);
    await signIn('credentials', { ...data, redirect: false });
    return null; // Return null on success
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          console.error("Auth error type:", error.type);
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function logout() {
    await signOut();
}

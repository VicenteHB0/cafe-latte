import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        await connectDB();
        
        try {
          const user = await User.findOne({ username: credentials.username });
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
          if (passwordsMatch) return user;
          
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
});

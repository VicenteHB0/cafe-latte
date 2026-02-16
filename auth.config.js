export const authConfig = {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized({ auth, request: nextUrl }) {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.nextUrl.pathname.startsWith('/menu') || 
                              nextUrl.nextUrl.pathname.startsWith('/orders') || 
                              nextUrl.nextUrl.pathname.startsWith('/admin');
        
        if (isOnDashboard) {
          if (isLoggedIn) return true;
          return false; // Redirect unauthenticated users to login page
        } else if (isLoggedIn) {
            // Redirect logged-in users away from login page
            if (nextUrl.nextUrl.pathname === '/login') {
                return Response.redirect(new URL('/menu', nextUrl.nextUrl));
            }
        }
        return true;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id;
          session.user.role = token.role;
          session.user.name = token.name;
          session.user.username = token.username;
        }
        return session;
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.username = user.username;
        }
        return token;
      },
    },
    providers: [], // Configured in auth.js
  };

import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * Factory function to generate NextAuth configuration based on the AUTH_PROVIDER environment variable.
 */
export function getAuthConfig(): NextAuthConfig {
  const authProvider = process.env.AUTH_PROVIDER || 'MockCredentials';

  switch (authProvider) {
    case 'AzureAD':
      return {
        providers: [
          // Add Azure AD provider setup here
        ],
      };

    case 'Google':
      return {
        providers: [
          // Add Google provider setup here
        ],
      };

    case 'Okta':
      return {
        providers: [
          // Add Okta provider setup here
        ],
      };

    case 'MockCredentials':
    default:
      return {
        providers: [
          CredentialsProvider({
            name: 'Mock SIUE Login',
            credentials: {
              email: { label: 'Email', type: 'text' },
              password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
              const email = typeof credentials?.email === 'string' ? credentials.email : '';

              if (email.endsWith('@siue.edu')) {
                // Determine role based on email
                const adminEmails = ['aleith@siue.edu', 'tpauli@siue.edu', 'bemoyer@siue.edu'];
                const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'student';
                
                return { 
                  id: email, 
                  name: email.split('@')[0], 
                  email,
                  role 
                } as any;
              }
              return null;
            },
          }),
        ],
        callbacks: {
          async jwt({ token, user }) {
            if (user) {
              token.role = (user as any).role;
            }
            return token;
          },
          async session({ session, token }) {
            if (session.user) {
              (session.user as any).role = token.role;
            }
            return session;
          },
        },
      };
  }
}
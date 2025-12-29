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
                return { id: '1', name: 'Mock User', email } as any;
              }
              return null;
            },
          }),
        ],
      };
  }
}
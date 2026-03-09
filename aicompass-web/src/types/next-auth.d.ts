import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    subscription: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      subscription: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    subscription: string;
  }
}

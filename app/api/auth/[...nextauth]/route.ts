/* import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { usuario, contrasena } = await request.json();
  // Busca el usuario por username o correo
  const user = await prisma.usuario.findFirst({
    where: {
      OR: [
        { username: usuario },
        { correo: usuario },
      ],
    },
    include: {
      rol: true,
    }
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
  }
  // Verifica la contraseña
  const valid = bcrypt.compareSync(contrasena, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }
  // Crear cookie de sesión (simple, con id_usuario)
  const sessionValue = JSON.stringify({
    id_usuario: user.id_usuario,
    username: user.username,
    rol: user.rol?.nombre ?? ""
  });
  cookies().set('session', sessionValue, {
    maxAge: 60 * 30, // 30 minutos
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  });
  // Devuelve datos básicos del usuario
  return NextResponse.json({
    id_usuario: user.id_usuario,
    username: user.username,
    correo: user.correo,
    rol: user.rol?.nombre ?? "",
  });
}
 */

// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import prisma from "@/lib/prisma";
// import bcrypt from "bcryptjs";
// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         username: { label: "Usuario", type: "text" },
//         password: { label: "Contraseña", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials || !credentials.username || !credentials.password) {
//           throw new Error("Faltan credenciales");
//         }
//         /* try {
//           const user = await autenticarUsuario(credentials);

//           if (!user || !user.token) {
//             throw new Error("Credenciales incorrectas.");
//           }

//           return user; // 🔹 Devuelve el usuario con el token generado
//         } catch (error) {
//           console.error("❌ Error en autorización:", error);
//           throw new Error(error.message || "Error en la autenticación.");
//         } */
//           try {
//             console.log("🔍 Autenticando usuario:", credentials.username);
  
//             // Buscar usuario por username o correo en Prisma
//             const usuario = await prisma.usuario.findFirst({
//               where: {
//                 OR: [
//                   { username: credentials.username },
//                   { correo: credentials.username },
//                 ],
//               },
//               include: { rol: true },
//             });

//             if (!usuario) throw new Error("Usuario no encontrado.");

//             // 🔑 Validar contraseña (Si aún no está encriptada, usa comparación simple)
//           const esPasswordCorrecto = await bcrypt.compare(credentials.password, usuario.password);
//           const esPasswordCorrecto2 = credentials.password === usuario.password;

//           if (!esPasswordCorrecto && !esPasswordCorrecto2) throw new Error("Contraseña incorrecta.");

//             return {
//               id: String(usuario.id_usuario),
//               name: usuario.username,
//               email: usuario.correo,
//               rol_id: usuario.id_rol,
//               role: usuario.rol?.nombre ?? "",
//             };
//           } catch (error) {
//             const msg = error instanceof Error ? error.message : String(error);
//             console.error("❌ Error en autenticación:", msg);
//             throw new Error(msg);
//           }
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/login", // 🔹 Página de inicio de sesión personalizada
//   },
//   callbacks: {
//   async jwt({ token, user }: { token: any, user?: any }) {
//       // Si el login fue exitoso, user existe
//       if (user) {
//         token.id = user.id;
//         token.username = user.name;
//         token.rol_id = user.rol_id;
//         token.role = user.role;
//         token.expiresAt = Date.now() + 1800 * 1000;
//       }
//       // Si no hay id en el token, no hay sesión válida
//       if (!token.id) {
//         return null;
//       }
//       // Si el token ha expirado, invalidar sesión
//       if (token.expiresAt && Date.now() > token.expiresAt) {
//         console.log("🔄 Token expirado. Cerrando sesión automáticamente.");
//         return null;
//       }
//       return token;
//     },
//   async session({ session, token }: { session: any, token: any }) {
//       // Si el token no tiene id, no hay sesión válida
//       if (!token || !token.id) {
//         console.log("❌ Token inválido. Sesión denegada.");
//         return null;
//       }
//       session.user.id = token.id;
//       session.user.username = token.username;
//       session.user.rol_id = token.rol_id;
//       session.user.role = token.role;
//       return session;
//     },
//   },
//   session: {
//     strategy: 'jwt' as const,
//     maxAge: 1800, // ⏳ Expira en 30 min
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };


  // app/api/auth/[...nextauth]/route.ts  (NextAuth v4)
  import NextAuth, { type NextAuthOptions } from "next-auth";
  import CredentialsProvider from "next-auth/providers/credentials";
  import prisma from "@/lib/prisma";
  import bcrypt from "bcryptjs";

  export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt", maxAge: 1800 }, // 30 min
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: "/login" },
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          username: { label: "Usuario", type: "text" },
          password: { label: "Contraseña", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Faltan credenciales");
          }

          const usuario = await prisma.usuario.findFirst({
            where: {
              OR: [
                { username: credentials.username },
                { correo: credentials.username },
              ],
            },
            include: { rol: true },
          });

          if (!usuario) throw new Error("Usuario no encontrado.");
          // 🔑 Validar contraseña (Si aún no está encriptada, usa comparación simple)
          const esPasswordCorrecto = await bcrypt.compare(credentials.password, usuario.password);
          const esPasswordCorrecto2 = credentials.password === usuario.password;

          if (!esPasswordCorrecto && !esPasswordCorrecto2) throw new Error("Contraseña incorrecta.");

          return {
            id: String(usuario.id_usuario),
            name: usuario.username,
            email: usuario.correo,
            rol_id: usuario.id_rol,
            role: usuario.rol?.nombre ?? "",
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        // En v4, siempre devuelve un token (no null)
        if (user) {
          token.id = (user as any).id;
          token.username = (user as any).name;
          token.rol_id = (user as any).rol_id;
          token.role = (user as any).role;
        }
        return token;
      },
      async session({ session, token }) {
        // Para “invalidar”, usa middleware; aquí devuelve session válida si hay token
        if (!token?.id) return session; // no agregues campos
        (session.user as any).id = token.id;
        (session.user as any).username = (token as any).username;
        (session.user as any).rol_id = (token as any).rol_id;
        (session.user as any).role = (token as any).role;
        return session;
      },
    },
  };

  const handler = NextAuth(authOptions);

  // v4: esta es la exportación correcta en App Router
  export { handler as GET, handler as POST };

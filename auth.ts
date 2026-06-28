import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {
          type: "username",
          label: "Username",
          placeholder: "johndoe",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: {
            username: credentials?.username as string,
            isActive: true,
          },
        });

        if (
          user &&
          (await bcrypt.compare(credentials?.password as string, user.password))
        ) {
          const { password, ...userWithoutPass } = user;
          let outletId = null;
          let privileges = null;
          let roleId = null;

          if (user.isSubAccount) {
            const userAccess = await prisma.userOutlet.findFirst({
              where: {
                userId: user.id,
                outlet: {
                  storeId: Number(user.storeId),
                  isActive: true,
                  deletedAt: null,
                },
                isActive: true,
              },
              include: {
                role: {
                  select: {
                    id: true,
                    // privileges: true,
                  },
                },
              },
            });

            roleId = userAccess?.role.id;
            outletId = userAccess?.outletId;
            // privileges = userAccess?.role.privileges;
          } else {
            const outlet = await prisma.outlet.findFirst({
              where: {
                storeId: Number(user.storeId),
                isActive: true,
              },
              orderBy: {
                id: "asc",
              },
            });

            const role = await prisma.role.findFirst({
              where: {
                id: 1,
              },
            });

            roleId = role?.id;
            // privileges = role?.privileges;
            outletId = outlet?.id;
          }

          return {
            ...userWithoutPass,
            outletId,
            roleId,
            privileges,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        // if (String(session.outletId) !== String(token.outletId)) {
        if (token.isSubaccount) {
          //check is user have access
          const userOutlet = await prisma.userOutlet.findFirst({
            where: {
              outlet: {
                storeId: Number(token.storeId),
              },
              userId: String(token.id),
              outletId: Number(session.outletId),
              isActive: true,
            },
            select: {
              userId: true,
              roleId: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  roles: true,
                },
              },
              outletId: true,
            },
          });

          if (userOutlet) {
            token = {
              ...token,
              outletId: userOutlet.outletId,
              roles: userOutlet.role.roles,
            };

            return { ...token, ...user };
          } else {
            return null;
          }
        } else {
          const outlet = await prisma.outlet.findFirst({
            where: {
              id: Number(session.outletId),
              storeId: Number(token.storeId),
            },
          });

          if (outlet) {
            token = {
              ...token,
              outletId: outlet.id,
            };

            return { ...token, ...user };
          } else {
            return null;
          }
        }
        // }
      }

      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token as any;

      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/auth/signout",
    error: "/auth/error", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
});

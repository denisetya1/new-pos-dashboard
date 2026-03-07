import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./lib/prisma"
import bcrypt from 'bcrypt'
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({
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
        }
      })
    
      if(user && (await bcrypt.compare(credentials?.password as string, user.password))) {
        const { password , ...userWithoutPass } = user
        let outletId = null
        let roles = null

        if(user.isSubAccount){
          const userAccess = await prisma.userOutlet.findFirst({
            where: {
              userId: user.id,
              outlet: {
                storeId: Number(user.storeId)
              }
            },
            include: {
              role: true,
            }
          })

          roles = userAccess?.role.roles
          outletId = userAccess?.outletId
        } else {
          const outlet = await prisma.outlet.findFirst({
            where: {
              storeId: Number(user.storeId)
            }
          })

          const role = await prisma.role.findFirst({
            where: {
              id: 1
            }
          })

          roles = role?.roles
          outletId = outlet?.id
        }
    
        return {
          ...userWithoutPass,
          outletId,
          roles
        }
      } else {
        return null
      }
    },
  })],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
  callbacks: {
    async jwt({token, user, trigger, session}){
      if(trigger === 'update'){
        if(String(session.update.outletId) !== String(token.outletId)){
          
          if(token.isSubaccount){
            //check is user have access
            const userOutlet = await prisma.userOutlet.findFirst({
              where: {
                outlet: {
                  storeId: Number(token.storeId),
                },
                userId: String(token.id),
                isActive: true
              },
              select: {
                userId: true,
                roleId: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                    roles: true
                  }
                },
                outletId: true
              }
            })

            if(userOutlet){
              token = {
                ...token,
                outletId: userOutlet.outletId,
                roles: userOutlet.role.roles
              }
            }
          } else {
            const outlet = await prisma.outlet.findFirst({
              where: {
                id: Number(session.update.outletId),
                storeId: Number(token.storeId)
              }
            })
            
            if(outlet){
              token = {
                ...token,
                outletId: outlet.id
              }
            }
          }

        }
      }

      return { ...token, ...user}
    },
    async session({session, token}){
     session.user = token as any

     return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  }
})
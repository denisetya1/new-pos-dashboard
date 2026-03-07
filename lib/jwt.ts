import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

 const DEFAULT_SIGN_OPTION: SignOptions = {
  expiresIn: "12h"
 }

export const signJwtAccessToken = (payload: JwtPayload, options: SignOptions = DEFAULT_SIGN_OPTION) => {
  const secretKey  = process.env.SECRET_KEY

  const token = jwt.sign(payload, secretKey as string, options)

  return token
 }

export const verifyJwt = (token: string) => {
  try{
    const secretKey = process.env.SECRET_KEY
    const decoded = jwt.verify(token, secretKey as string)

    return decoded as JwtPayload
  } catch (error) {
    console.log(error)
  }
 }
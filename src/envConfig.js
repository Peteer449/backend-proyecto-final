import * as dotenv from "dotenv"
dotenv.config()
export const envConfig={
  BASE_DE_DATOS_CODERDB:process.env.BASE_DE_DATOS_CODERDB,
  BASE_DE_DATOS_SESSIONSDB:process.env.BASE_DE_DATOS_SESSIONSDB,
  BASE_DE_DATOS_FIREBASE:process.env.BASE_DE_DATOS_FIREBASE,
  NODE_ENV:process.env.NODE_ENV || "development",
  PORT:process.env.PORT,
  GMAILPASSWORD:process.env.GMAILPASSWORD,
  TOKENTWILIO:process.env.TOKENTWILIO
}
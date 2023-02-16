import twilio from "twilio"
import { envConfig } from "../envConfig.js"

const accountId = "AC0ca3aacecb921c21d262e8afef773cf8"
const tokenTwilio = envConfig.TOKENTWILIO

const twilioPhone = "whatsapp:+14155238886"
const adminPhone = "whatsapp:+5491167056074"

const twilioClient = twilio(accountId,tokenTwilio)

export {twilioClient,twilioPhone,adminPhone}
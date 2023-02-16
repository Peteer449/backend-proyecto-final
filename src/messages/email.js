import nodemailer from "nodemailer"
import { envConfig } from "../envConfig.js";

const adminEmail='pedro.esposito99@gmail.com'
const adminPassword=envConfig.GMAILPASSWORD

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
      user: adminEmail,
      pass: adminPassword
  },
  secure:false,
  tls:{
    rejectUnauthorized:false
  }
});

export {transporter,adminEmail}
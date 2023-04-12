import express from "express";
import passport from "passport";
import bcrypt from "bcrypt"
import { Strategy as LocalStrategy} from "passport-local";
import { UserModel } from "../../models/modelsMongo.js";
import { transporter,adminEmail } from "../../messages/email.js"


const router = express.Router();


router.post("/login",passport.authenticate("loginStrategy",{
  failureRedirect:"/login",
  failureMessage:true,
  failureFlash: true
}), async (req,res)=>{
  req.session.user = req.user
  res.cookie('email',req.user.mail)
  res.cookie('name',req.user.name)
  res.redirect("/")
})


router.get("/signup",(req,res)=>{
  res.render("signup",{error:req.flash('error')[0]})
})

passport.use("signupStrategy",new LocalStrategy(
  {
    passReqToCallback:true,
    usernameField:"mail",
  },
  (req,username,password,done)=>{
    UserModel.findOne({mail:username},(err,userFound)=>{
      if(err) return done(err)
      if(userFound)return done(null,false,{message:"El usuario ya existe"})
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
          const newUser = {
            name:req.body.name,
            adress:req.body.adress,
            age:req.body.age,
            phone:req.body.phone,
            image:req.body.image,
            mail:username,
            password:hash
          }
          UserModel.create(newUser,(error,userCreated)=>{
            if(err)return done(error,null,{message:"Error al crear el usuario"})
            return done(null,userCreated)
          })
        })
      })
    })
  }
))

router.post("/signup", passport.authenticate("signupStrategy",{
  failureRedirect:"/signup",
  failureMessage:true,
  failureFlash:true
}),async (req,res)=>{
  let {name,age,phone,image,adress,mail} = req.body
  try {
    await transporter.sendMail({
      from:"server app Node",
      to:adminEmail,
      subject:"Nuevo registro",
      html:`<div class="d-flex justify-content-evenly">
      <div>
        <h2>Informacion de la cuenta</h2>
        <hr/>
        <h3>Nombre: ${name}</h3>
        <h3>Calle: ${adress}</h3>
        <h3>Edad: ${age}</h3>
        <h3>Telefono: ${phone}</h3>
        <h3>Avatar: <img src="${image}" height="50"/> </h3>
        <h3>Mail: ${mail}</h3>
      </div>
    </div>`
    })
    res.redirect("/login")
  } catch (error) {
    res.send(error)
  }
})

export {router as signupRouter}
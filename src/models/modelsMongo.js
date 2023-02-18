import mongoose from "mongoose";

const productsCollection = "productos"

const ProductSchema = new mongoose.Schema({
  id:{type:Number,require:true,max:100},
  title:{type:String,require:true,max:25},
  price:{type:Number,require:true,max:100},
  thumbnail:{type:String,require:false},
})
const cartCollection = "carritos"

const cartSchema = new mongoose.Schema({
  id:{type:Number,require:true,max:100},
  products:{type:Array,require:true},
  timestamp:{type:Number,require:true,max:100}
})

const userCollection = "users"

const UserSchema = new mongoose.Schema({
  name:{
    type:String,
    require:true
  },
  adress:{
    type:String,
    require:true
  },
  age:{
    type:Number,
    require:true
  },
  phone:{
    type:Number,
    require:true
  },
  image:{
    type:String,
    require:true
  },
  mail:{
    type:String,
    require:true
  },
  password:{
    type:String,
    require:true
  }
})

export const UserModel = mongoose.model(userCollection,UserSchema)

export const carritos = mongoose.model(cartCollection,cartSchema)

export const productos = mongoose.model(productsCollection,ProductSchema)
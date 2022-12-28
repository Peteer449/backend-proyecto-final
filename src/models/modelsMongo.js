import mongoose from "mongoose";

const productsCollection = "productos"

const ProductSchema = new mongoose.Schema({
  id:{type:Number,require:true,max:100},
  title:{type:String,require:true,max:25},
  price:{type:Number,require:true,max:100},
  thumbnail:{type:String,require:false},
})
const cartCollection = "carritos"

const cartchema = new mongoose.Schema({
  id:{type:Number,require:true,max:100},
  products:{type:Array,require:true},
  timestamp:{type:Number,require:true,max:100}
})

export const carritos = mongoose.model(cartCollection,cartchema)

export const productos = mongoose.model(productsCollection,ProductSchema)
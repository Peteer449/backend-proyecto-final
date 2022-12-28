import mongoose from "mongoose";
import * as model from "../models/modelsMongo.js"

class ContenedorMongo{
    
    constructor(options,tableName){
        mongoose.connect(options.connection.url,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
        this.tableName = tableName;
    }
    
    
    async getById(id){
        try {
            let response =""
            this.tableName === "productos"? response = await model.productos.find({"id":id}):response=await model.carritos.find({"id":id});
            return response;
        } catch (error) {
            return {message:`Hubo un error ${error}`, error:true};
        }
    }

    async getAll(){
        try {
            let response =""
            this.tableName === "productos"? response = await model.productos.find({}):response=await model.carritos.find({});
            return response;
        } catch (error) {
            return [];
        }
    }

    async save(product){
        try {
            let response =""
            this.tableName === "productos"? response = await model.productos.insert({product}):response=await model.carritos.insert({product});
            return response;
        } catch (error) {
            return {message:`Error al guardar: ${error}`};
        }
    }

    async updateById(body, id){
        try {
            let response =""
            this.tableName === "productos"? response = await model.productos.update({"id":id},{body}):response=await model.carritos.update({"id":id},{body});
            return response;
        } catch (error) {
            return {message:`Error al actualizar: no se encontró el id ${id}`};
        }
    }

    async deleteById(id){
        try {
            let response =""
            this.tableName === "productos"? response = await model.productos.deleteOne({"id":id}):response=await model.carritos.deleteOne({"id":id});
            return response;
        } catch (error) {
            return {message:`Error al borrar: no se encontró el id ${id}`};
        }
    }

    async deleteAll(){
        try {
            let response =""
            this.tableName === "productos"? response = await model.productos.deleteMany({}):response=await model.carritos.deleteMany({});
            return response;
        } catch (error) {
            return {message:`Error al borrar todo: ${error}`};
        }
    }

}

export {ContenedorMongo}
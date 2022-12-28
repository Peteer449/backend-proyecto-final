import {readFileSync} from "fs"
import admin from "firebase-admin"
const serviceAccount = JSON.parse(readFileSync("firebaseKey.json"))
admin.initializeApp(
  {
    credential:admin.credential.cert(serviceAccount),
    databaseURL:"https://ecommerce-673af.firebase.io"
  }
)
class ContenedorFirebase{
  constructor(options,collection){
        this.database = admin.firestore()
        this.collection = this.database.collection(collection)
      }      
      
      async getById(id){
        try {
            const product =  this.collection.doc(`${id}`);
            const item = await product.get()
            const response = item.data()
            return response
        } catch (error) {
            return {message:`Hubo un error ${error}`, error:true};
        }
    }

    async getAll(){
        try {
            const snapshot =await this.collection.get()
            let response = snapshot.docs;
            let results = response.map(elm=>{
                return {
                    id:elm.id,
                    ...elm.data()
                }
            });
            return results;
        } catch (error) {
            return [];
        }
    }

    async save(product){
        try {
            let doc = this.collection.doc()
            await doc.create({product})
        } catch (error) {
            return {message:`Error al guardar: ${error}`};
        }
    }

    async updateById(body, id){
        try {
            const doc = this.collection.doc(`${id}`)
            let item = await doc.update({body})
            return {message:`updateaste ${item}`}
        } catch (error) {
            return {message:`Error al actualizar: no se encontró el id ${id}`};
        }
    }

    async deleteById(id){
        try {
            const doc = this.collection.doc(`${id}`)
            const item = await doc.delete()
            return{message:`Borraste ${item}`}
        } catch (error) {
            return {message:`Error al borrar: no se encontró el id ${id}`};
        }
    }

    async deleteAll(){
        try {
            await this.collection.doc().deleteAll();
            return {message:"delete successfully"}
        } catch (error) {
            return {message:`Error al borrar todo: ${error}`};
        }
    }

}

export {ContenedorFirebase}
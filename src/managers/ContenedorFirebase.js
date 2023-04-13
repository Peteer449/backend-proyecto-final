import {readFileSync} from "fs"
import admin from "firebase-admin"
const serviceAccount = JSON.parse(readFileSync("./firebaseKey.json"))
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
            const response =await item.data()
            return {id:id,...response}
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
            results.sort((a,b)=>a.order - b.order)
            return results;
        } catch (error) {
            return [];
        }
    }

    async save(product,email,timestamp,bool){
        try {
            if(timestamp){
                if(bool){
                    console.log(2)
                    let {title,price,image,id}=product
                    price=parseInt(price)
                    let allProducts = await this.getById(email)
                    let oldProducts = allProducts.products
                    let doc = this.collection.doc(email)
                    oldProducts.push({id,title,price,image})
                    await doc.update({products:oldProducts,timestamp:timestamp})
                }else{
                    console.log(3)
                    let {title,price,image,id}=product
                    price=parseInt(price)
                    let doc = this.collection.doc(email)
                    await doc.create({products:[{id,title,price,image}],timestamp})
                }
            }
            else{
                console.log(1)
                let {title,price,image}=product
                price=parseInt(price)
                let doc = this.collection.doc()
                await doc.create({title,price,image})
            }
            return this.getById(email)
        } catch (error) {
            return {message:`Error al guardar: ${error}`};
        }
    }

    async updateById(body,id){
        try {
            const doc = this.collection.doc(`${id}`)
            if(body.products){
                await doc.update({products:body.products})
            }else{
                await doc.update({updated:body})
            }
            return this.getById(id)
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
            await this.collection
            .get()
            .then(res => {
                res.forEach(element => {
                element.ref.delete();
                });
            });
            return {message:"delete successfully"}
        } catch (error) {
            return {message:`Error al borrar todo: ${error}`};
        }
    }

    async saveMessage(message){
        let allMessages =await this.getAll()
        let biggerOrder = allMessages.map(e=>e.order)
        let max = 0
        biggerOrder.forEach(num=>{
            if (num > max){
                max=num
            }
        })
        const addDoc = await this.collection.add({author:message.author,message:message.message,order:max+1})
        return {id:addDoc._path.segments[1],message}
    }   

}

export {ContenedorFirebase}
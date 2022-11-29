const ProductsClass = require("./ProductsClass")
const productClass = new ProductsClass()
let cart = []
let cartId = 0
let productId = 1

class Cart{
  createCart(){
    cartId++
    cart.push({cartId})
    return cartId
  }
  deleteCart(id){
    const itemToDelete=cart.find(e=>e.id===id)
    const index = cart.indexOf(itemToDelete)
    cart.splice(index,1)
  }
  saveProduct(id){
    let product = productClass.getById(id)
    cart.push({product,productId})
  }
  getAllProducts(){
    return cart
  }
  deleteById(id){
    const itemToDelete=cart.find(e=>e.id===id)
    const index = cart.indexOf(itemToDelete)
    cart.splice(index,1)
  }
}

module.exports = Cart
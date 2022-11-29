let productsTable = document.getElementById("productsTable")
let productForm = document.getElementById("productForm")
let id = 1
let title = document.getElementById("title")
let price = document.getElementById("price")
let image = document.getElementById("image")
let user = ""

if(user===""){
  Swal.fire({
    title:"Bienvenido",
    text:"Ingresa tu nombre de usuario",
    input:"text",
    allowOutsideClick:false
  }).then(data=>{
    user=data.value
  })
}

productForm.addEventListener("submit",event=>{
  event.preventDefault()
  console.log(image)
  socket.emit("addProduct",{id,title:title.value,price:price.value,image:image.value})
  id++
})

socket.on("allProducts",data=>{
  productsTable.innerHTML=""
  data.forEach(element=>{
    var tblBody = document.createElement("tr")
    tblBody.innerHTML =`
    <tr class="align-middle">
      <th scope="row">${element.id}</th>
      <td>${element.title}</td>
      <td>${element.price}</td>
      <td><img src="${element.image}" height="100px"></td>
    </tr>
    `
    productsTable.appendChild(tblBody)
  })
})
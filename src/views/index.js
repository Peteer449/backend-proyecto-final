// const socket = io()
// let chatInput = document.getElementById("chatInput")
// let chatForm = document.getElementById("chatForm")
// let user='<%=Session["user"]%>';


// chatForm.addEventListener("submit",(event)=>{
//     event.preventDefault()
//     socket.emit("chatInput",{author:user, message:chatInput.value})
//     chatInput.value = ""
//   })

//   // Denormalizacion
//   const authorSchema = new normalizr.schema.Entity("authors",{},{idAttribute:"email"});//id:con el valor del campo email.
//   const messageSchema = new normalizr.schema.Entity("messages",
//       {
//           author:authorSchema
//       }
//   );
//   const chatSchema = new normalizr.schema.Entity("chats", {
//       messages: [messageSchema]
//   });
  

//   socket.on("allMessages",async (data)=>{
//     const dataDenormalized = normalizr.denormalize(data.result,chatSchema,data.entities);
//     document.getElementById("container").innerHTML = ""
//     dataDenormalized.messages.forEach(element => {
//       const paragraph = document.createElement("p")
//       paragraph.innerHTML = `${element.author.email} <strong>${element.author.username}:</strong> ${element.message}`
//       document.getElementById("container").appendChild(paragraph)
//     });
//   })
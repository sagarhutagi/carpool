const io = require('socket.io')(3000,{
    cors:['http://localhost']
});

console.log("Server Started...");

io.on('connection',socket=>{
    console.log(`Received connection from ${socket.id}`);
    socket.on('send-message',(message,receiver_id)=>{
        console.log(`${socket.id}: ${message} , and the receiver id is ${receiver_id}`);
        if(receiver_id==''){
            socket.broadcast.emit('receive-message',message,socket.id);
        }else{
            socket.to(receiver_id).emit('receive-message',message,socket.id); 
        }
    });
});
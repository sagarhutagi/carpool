import { useState,useEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client' // <-- Correct import
const socket = io('http://localhost:3000');
console.log(`Connected to server with id: ${socket.id}`);


function App() {
  const [msg_box_txt,set_msg_box_txt] = useState(`Connected to server`);
  const [send_box_txt,set_send_box_txt] = useState(``);
  const [to_box_txt,set_to_box_txt] = useState("");

    useEffect(() => {
  const handleConnect = () => {
    set_msg_box_txt(`Connected to server with id: ${socket.id}`);
    console.log(`Connected to server with id: ${socket.id}`);
  };

  const handleReceive = (message, from) => {
    console.log(`Message received from ${from}: ${message}`);
    set_msg_box_txt(prev => prev + `\n${from}: ${message}`);
  };

  socket.on('connect', handleConnect);
  socket.on('receive-message', handleReceive);

  return () => {
    socket.off('connect', handleConnect);
    socket.off('receive-message', handleReceive);
  };
}, []);

  const onClick = () => {
    console.log("Button Clicked");
    // set_msg_box_txt("Button Clicked");
    set_msg_box_txt(msg_box_txt + `\nYou: ${send_box_txt}`);
    socket.emit('send-message', send_box_txt,to_box_txt);
  }

  const handleToChange = (e) => {
    set_to_box_txt(e.target.value);
  }

  const handleSendChange = (e) => {
    set_send_box_txt(e.target.value);
  }

  return (
    <>
    <textarea name="" id="message_box" cols="100" rows="20" value={msg_box_txt}></textarea>
    <br />
    To: <input type="text" value={to_box_txt} onChange={handleToChange}/>
    <br />
    Message: <input type="text" value={send_box_txt} onChange={handleSendChange}/>
    <br />
    <br />
    <button onClick={onClick} >Send</button>
    </>
  )
}

export default App

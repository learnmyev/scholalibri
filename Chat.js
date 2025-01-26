// src/Chat.js
import React, { useState } from 'react';

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState('YourName'); // You might want to implement a way to set this

  const sendMessage = async () => {
    if (message) {
      setMessages(prevMessages => [...prevMessages, { user: 'You', text: message }]);
      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message, userName: userName }),
        });
        const data = await response.json();
        if (data.reply) {
          setMessages(prevMessages => [...prevMessages, { user: 'Michael', text: data.reply }]);
        } else if (data.error) {
          setMessages(prevMessages => [...prevMessages, { user: 'Error', text: data.error }]);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [...prevMessages, { user: 'Error', text: 'Failed to connect to the server. Please try again later.' }]);
      }
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Chat with Michael</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.user}:</strong> {msg.text}</p>
        ))}
      </div>
      <input 
        type="text" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Type your message here..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;
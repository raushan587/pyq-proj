// public/js/assistant.js
document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const input = document.getElementById('user-input');
    const userMessage = input.value;
    appendMessage('You', userMessage);
    input.value = '';
  
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });
  
    const data = await response.json();
    appendMessage('Assistant', data.reply);
  });
  
  function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const message = document.createElement('div');
    message.classList.add('message');
    message.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
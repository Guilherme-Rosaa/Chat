const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');


const server = http.createServer((req, res) => {
  if (req.url === '/chat') {
    fs.readFile('chat.html', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('Página não encontrada');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('Página não encontrada');
  }
});

const wss = new WebSocket.Server({ server });
mongoose.connect('mongodb://localhost:27017/HistoricoChat', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro na conexão com o MongoDB:'));
db.once('open', async function () {
  console.log('Conexão com o MongoDB estabelecida com sucesso.');
  try {
    const messages = await loadMessages();
    console.log(messages);
    const messagesByChannel = {};

    messages.forEach(element => {
      const channelId = element.channelId;
      if (!messagesByChannel[channelId]) {
        messagesByChannel[channelId] = [];
      }
      messagesByChannel[channelId].push({
        sender: element.sender,
        message: element.message,
        channelId: element.channelId
      });
    });

    for (const channelId in messagesByChannel) {
      if (messagesByChannel.hasOwnProperty(channelId)) {
        if (!channels[channelId]) {
          channels[channelId] = {
            clients: new Set(),
            history: []
          };
        }

        const messagesForChannel = messagesByChannel[channelId];
        channels[channelId].history = messagesForChannel;
      }
    }
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
  }

});

const chatMessageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  channelId: String,
  timestamp: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

const channels = {};

wss.on('connection', (socket) => {
  console.log('Novo cliente conectado.');


  socket.on('message', async (message) => {
    const data = JSON.parse(message);

    if (data.type === 'identification') {
      const channelId = data.channelId;
      if (!channels[channelId]) {
        channels[channelId] = {
          clients: new Set(),
          history: []
        };
      }
      socket.clientName = data.name;
      socket.channelId = channelId;
      channels[channelId].clients.add(socket);

      try {
        const messages = await ChatMessage.find({ channelId: channelId }).exec();
        const messagesForChannel = messages.map(element => ({
          sender: element.sender,
          message: element.message,
          channelId: element.channelId
        }));

        channels[channelId].history = messagesForChannel;
        socket.send(JSON.stringify(channels[channelId].history));
      } catch (err) {
        console.error('Erro ao buscar mensagens:', err);
      }
    } else if (data.type === 'message') {
      const channelId = socket.channelId;
      const channel = channels[channelId];

      const chatMessage = new ChatMessage({
        sender: socket.clientName,
        message: data.message,
        channelId: channelId
      });

      chatMessage.save()
        .then(() => {
          channel.history.push({ sender: socket.clientName, message: data.message, channelId: channelId });
        })
        .catch((err) => {
          console.error('Erro ao salvar mensagem no MongoDB:', err);
        });

      const messageToSend = JSON.stringify({ sender: socket.clientName, message: data.message, channelId: channelId });
      for (const client of channel.clients) {
        client.send(messageToSend);
      }
    }
  });

  socket.on('close', () => {
    console.log('Cliente desconectado.');
    const channelId = socket.channelId;
    const channel = channels[channelId];
    if (channel) {
      channel.clients.delete(socket);
    }
  });
});

server.listen(8081, () => {
  console.log('Servidor WebSocket está ouvindo na porta 8081');


});
async function loadMessages() {
  try {
    const messages = await ChatMessage.find().exec();
    return messages;
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
  }
}

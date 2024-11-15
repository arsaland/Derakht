import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateFinalStory, generateOpeningSentence } from './openai.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        `http://${process.env.LOCAL_IP}:5173`
      ],
    methods: ['GET', 'POST']
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const games = new Map();
const ROUNDS = 4;

io.on('connection', (socket) => {
  socket.on('createGame', ({ playerName }, callback) => {
    const roomId = Math.random().toString(36).substring(2, 8);
    const gameState = {
      players: [{
        id: socket.id,
        name: playerName,
        isHost: true,
        sentenceIndices: []
      }],
      currentTurn: '',
      sentences: [],
      round: 0,
      showRoundTransition: false,
      isProcessing: false,
      finalStory: '',
      showFinalStory: false
    };

    games.set(roomId, gameState);
    socket.join(roomId);
    callback({ roomId });
    io.to(roomId).emit('gameState', gameState);
  });

  socket.on('joinGame', ({ playerName, roomId }, callback) => {
    const game = games.get(roomId);
    if (!game) {
      callback({ success: false });
      return;
    }

    game.players.push({
      id: socket.id,
      name: playerName,
      isHost: false,
      sentenceIndices: []
    });

    socket.join(roomId);
    callback({ success: true });
    io.to(roomId).emit('gameState', game);
  });

  socket.on('startGame', async ({ roomId }) => {
    const game = games.get(roomId);
    if (!game || !game.theme) return;

    game.round = 1;
    game.showRoundTransition = true;
    io.to(roomId).emit('gameState', { ...game });

    // Generate opening sentence based on theme
    const openingSentence = await generateOpeningSentence(game.theme);

    setTimeout(() => {
      game.showRoundTransition = false;
      game.currentTurn = game.players[0].id;
      game.sentences = [openingSentence];
      io.to(roomId).emit('gameState', { ...game });
    }, 2000);
  });

  socket.on('submitSentence', async ({ roomId, sentence }) => {
    const game = games.get(roomId);
    if (!game || game.currentTurn !== socket.id) return;

    const currentPlayer = game.players.find(p => p.id === game.currentTurn);
    if (currentPlayer) {
      currentPlayer.sentenceIndices = [
        ...(currentPlayer.sentenceIndices || []),
        game.sentences.length
      ];
    }

    game.sentences.push(sentence);

    const currentPlayerIndex = game.players.findIndex(p => p.id === socket.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    game.currentTurn = game.players[nextPlayerIndex].id;

    const sentencesInCurrentRound = (game.sentences.length - 1) % game.players.length;
    const isRoundComplete = sentencesInCurrentRound === 0;

    if (isRoundComplete && game.round < ROUNDS) {
      game.round++;
      game.showRoundTransition = true;
      io.to(roomId).emit('gameState', { ...game });

      setTimeout(() => {
        game.showRoundTransition = false;
        io.to(roomId).emit('gameState', { ...game });
      }, 2000);
    }

    // Check if game is complete
    if (game.sentences.length === (ROUNDS * game.players.length) + 1) {
      game.isProcessing = true;
      io.to(roomId).emit('gameState', { ...game });

      // Generate final story
      const finalStory = await generateFinalStory(game.sentences);
      game.isProcessing = false;
      game.finalStory = finalStory;
      game.showFinalStory = true;
    }

    io.to(roomId).emit('gameState', { ...game });
  });

  socket.on('disconnect', () => {
    games.forEach((game, roomId) => {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);

        if (game.players.length === 0) {
          games.delete(roomId);
        } else {
          if (game.currentTurn === socket.id) {
            game.currentTurn = game.players[0].id;
          }
          io.to(roomId).emit('gameState', game);
        }
      }
    });
  });

  socket.on('selectTheme', ({ roomId, theme }) => {
    const game = games.get(roomId);
    if (!game) return;

    game.theme = theme;
    io.to(roomId).emit('gameState', { ...game });
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
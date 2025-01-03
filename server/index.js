import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname, join } from 'path';
import { generateFinalStory, generateOpeningSentence, generateContinuationSentence, generateStoryImage, generateStoryAudio } from './openai.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8081;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? '*'
      : [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        `http://${process.env.LOCAL_IP}:8080`
      ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io/'
});

const nsp = io.of('/'); // Default namespace

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '../public')));
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' data: *; style-src 'self' 'unsafe-inline'; img-src 'self' data: *; media-src 'self' data: *; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  next();
});

app.use('/audio', (req, res, next) => {
  console.log('Audio request:', req.path);
  res.set('Content-Type', 'audio/mpeg');
  next();
});

if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  app.use('/public', express.static(join(__dirname, '../public')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));

  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const games = new Map();
const ROUNDS = 4;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

io.on('connection', (socket) => {
  socket.on('createGame', ({ playerName }, callback) => {
    const roomId = Array.from({ length: 4 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');

    const gameState = {
      players: [{
        id: socket.id,
        name: playerName,
        isHost: true,
        sentenceIndices: [],
        features: {
          tts: false,
          images: false
        }
      }],
      currentTurn: '',
      sentences: [],
      round: 0,
      showRoundTransition: false,
      isProcessing: false,
      finalStory: '',
      showFinalStory: false,
      aiSentenceIndices: [0]
    };

    games.set(roomId, gameState);
    socket.join(roomId);
    callback({ roomId });
    io.to(roomId).emit('gameState', gameState);
  });

  socket.on('joinGame', ({ playerName, roomId }, callback) => {
    const normalizedRoomId = roomId.toUpperCase();
    const actualRoomId = Array.from(games.keys()).find(
      key => key.toUpperCase() === normalizedRoomId
    );
    const game = actualRoomId ? games.get(actualRoomId) : null;

    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }

    if (game.players.length >= MAX_PLAYERS) {
      callback({ success: false, error: 'Game is full' });
      return;
    }

    game.players.push({
      id: socket.id,
      name: playerName,
      isHost: false,
      sentenceIndices: [],
      features: {
        tts: false,
        images: false
      }
    });

    socket.join(actualRoomId);
    callback({ success: true });
    io.to(actualRoomId).emit('gameState', game);
  });

  socket.on('startGame', async ({ roomId }) => {
    const game = games.get(roomId);
    if (!game || !game.theme) return;

    if (game.players.length > MAX_PLAYERS) {
      io.to(roomId).emit('gameError', 'Maximum 8 players allowed');
      return;
    }

    game.round = 1;
    game.showRoundTransition = true;
    game.currentTurn = 'ai';
    io.to(roomId).emit('gameState', { ...game });

    // Generate opening sentence
    const openingSentence = await generateOpeningSentence(game.theme);

    setTimeout(() => {
      game.showRoundTransition = false;
      game.sentences = [openingSentence];
      game.currentTurn = game.players[0].id;
      io.to(roomId).emit('gameState', { ...game });
    }, 2000);
  });

  socket.on('submitSentence', async ({ roomId, sentence }) => {
    const game = games.get(roomId);
    if (!game) return;

    // Check if it's actually this player's turn
    if (game.currentTurn !== socket.id) {
      return;
    }

    try {
      // Clear any lingering typing state
      game.typingPlayer = null;

      const currentPlayer = game.players.find(p => p.id === game.currentTurn);
      if (currentPlayer) {
        currentPlayer.sentenceIndices = [
          ...(currentPlayer.sentenceIndices || []),
          game.sentences.length
        ];
      }

      game.sentences.push(sentence);

      // Find current player's index
      const currentPlayerIndex = game.players.findIndex(p => p.id === socket.id);

      // If this was the last player in the round
      if (currentPlayerIndex === game.players.length - 1) {
        if (game.round < ROUNDS) {
          // Start next round
          game.round++;
          game.showRoundTransition = true;
          game.typingPlayer = null; // Clear typing state before transition
          io.to(roomId).emit('gameState', { ...game });

          // Wait for round transition
          await new Promise(resolve => setTimeout(resolve, 2000));

          // AI's turn
          game.showRoundTransition = false;
          game.currentTurn = 'ai';
          game.typingPlayer = null; // Ensure typing state is clear
          io.to(roomId).emit('gameState', { ...game });

          // Generate AI's sentence
          const aiSentence = await generateContinuationSentence(game.sentences);
          game.sentences.push(aiSentence);
          game.aiSentenceIndices = [...(game.aiSentenceIndices || []), game.sentences.length - 1];

          // Move to first player
          game.currentTurn = game.players[0].id;
          game.typingPlayer = null; // Clear typing state before next player
          io.to(roomId).emit('gameState', { ...game });
        } else {
          // Final round complete
          game.isProcessing = true;
          game.typingPlayer = null; // Clear typing state
          io.to(roomId).emit('gameState', { ...game });

          try {
            // Generate final story
            const finalStory = await generateFinalStory(game.sentences);

            // Generate image and audio in parallel if features are enabled
            const [storyImage, storyAudio] = await Promise.all([
              generateStoryImage(finalStory, game.features),
              generateStoryAudio(finalStory, game.features)
            ]);

            // Update game state with final content
            game.finalStory = finalStory;
            game.storyImage = storyImage;
            game.storyAudio = storyAudio;
            game.isProcessing = false;
            game.showFinalStory = true;

            // Emit final state
            io.to(roomId).emit('gameState', { ...game });
          } catch (error) {
            console.error('Error generating final content:', error);
            // Handle error gracefully
            game.isProcessing = false;
            game.finalStory = game.sentences.join("\n");
            game.showFinalStory = true;
            io.to(roomId).emit('gameState', { ...game });
          }
        }
      } else {
        // Move to next player
        game.currentTurn = game.players[currentPlayerIndex + 1].id;
        io.to(roomId).emit('gameState', { ...game });
      }
    } catch (error) {
      console.error('Error processing sentence:', error);
      game.typingPlayer = null;
      io.to(roomId).emit('gameState', { ...game });
    }
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

    // Find any game where this player was typing
    for (const [roomId, game] of games.entries()) {
      if (game.typingPlayer === socket.id) {
        game.typingPlayer = null;
        io.to(roomId).emit('gameState', { ...game });
      }
    }
  });

  socket.on('selectTheme', ({ roomId, theme }) => {
    const game = games.get(roomId);
    if (!game) return;

    game.theme = theme;
    io.to(roomId).emit('gameState', { ...game });
  });

  socket.on('typing', ({ roomId }) => {
    const game = games.get(roomId);
    if (!game) return;

    game.typingPlayer = socket.id;
    io.to(roomId).emit('gameState', { ...game });
  });

  socket.on('stopTyping', ({ roomId }) => {
    const game = games.get(roomId);
    if (!game || game.typingPlayer !== socket.id) return;

    game.typingPlayer = null;
    io.to(roomId).emit('gameState', { ...game });
  });

  socket.on('toggleFeature', ({ roomId, feature, enabled }) => {
    const game = games.get(roomId);
    if (!game) return;

    // Update the feature flag
    game.features = {
      ...game.features,
      [feature]: enabled
    };

    // Broadcast the updated game state
    io.to(roomId).emit('gameState', { ...game });
  });

  socket.on('typing:end', ({ roomId }) => {
    const game = games.get(roomId);
    if (!game) return;

    if (game.typingPlayer === socket.id) {
      game.typingPlayer = null;
      io.to(roomId).emit('gameState', { ...game });
    }
  });

  socket.on('updateGameFeatures', ({ roomId, features }) => {
    const game = games.get(roomId);
    if (game) {
      game.features = features;
      io.to(roomId).emit('gameState', { ...game });
    }
  });
});

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' data: *; style-src 'self' 'unsafe-inline'; img-src 'self' data: *; media-src 'self' data: *; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  next();
});

// Add this before your other routes
app.get('/health', (req, res) => {
  res.status(200).type('text/plain').send('OK');
});

app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

// Clean up old audio files periodically (optional)
async function cleanupAudioFiles() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    const files = await fs.readdir(audioDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(audioDir, file);
      const stats = await fs.stat(filePath);

      // Delete files older than 1 hour
      if (now - stats.mtime.getTime() > 3600000) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Audio cleanup error:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupAudioFiles, 3600000);

// Add this logging middleware for audio requests
app.use('/audio', (req, res, next) => {
  console.log('Audio file requested:', req.path);
  next();
}, express.static(path.join(process.cwd(), 'public', 'audio')));

// Add error handling for audio files
app.use('/audio', (err, req, res, next) => {
  console.error('Error serving audio:', err);
  res.status(500).send('Error serving audio file');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import boardsRouter from './routes/boards.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rahulkohli7078_db_user:todo123@notedb.vd8zprx.mongodb.net/?retryWrites=true&w=majority&appName=noteDB';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.body) {
    console.log('Parsed body:', JSON.stringify(req.body));
  }
  next();
});

app.use('/api/boards', boardsRouter);

app.get('/', (req, res) => {
  res.send("Backend is connected");
});

// For Vercel deployment, export the app
export default app;

// For local development, listen if not in production
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

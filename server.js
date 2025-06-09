import express from 'express';
const app = express();
import judgeRoute from './routes/judge.js';
import dotenv from 'dotenv';
import submitRoute from './routes/submit.js';
import cors from 'cors';
dotenv.config();
app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json());

app.use('/api/judge', judgeRoute);
app.use('/api/submit', submitRoute);

app.get('/', (req, res) => {
  res.send('Judge0 Playground is live!');
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
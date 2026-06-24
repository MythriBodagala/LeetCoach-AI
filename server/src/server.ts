import app from './app';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`LeetCoach AI Server is live on port ${PORT}`);
});
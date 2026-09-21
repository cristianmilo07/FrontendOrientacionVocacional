import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, 'dist/pruebaEstudiantes/browser');

const app = express();

app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

app.get('*', (req, res) => {
  res.sendFile(join(browserDistFolder, 'index.html'));
});

const port = process.env.PORT || 10000;
app.listen(port, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Server listening on http://localhost:${port}`);
});

export const reqHandler = (req, res) => app(req, res);

import express, { Express } from 'express';
import * as dotenv from 'dotenv';
import router from './router';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

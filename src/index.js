import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import httpStatus from 'http-status';
import logger from 'ttt-packages/lib/config/logger';
import customEnv from 'custom-env';
import authRoutes from './auth.routes';
import driver from 'ttt-packages/lib/adapter/DBDriver';
import cookieParser from 'cookie-parser';

customEnv.env(process.env.NODE_ENV);

const app = express();

app.use(express.json({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
const local = [
  'https://localhost:3000',
];
const stage = [
  'https://stage.api.timetotrain.fit',
];
const prod = [
  'https://api.timetotrain.fit',
];

// enable cors
app.use(cors({ credentials: true, origin: [...local, ...stage, ...prod] }));
app.options('*', cors());

// v2 api routes
app.use('/api/v2/auth', authRoutes);

app.get('/api/v2/auth/health', (req, res) => {
  logger.debug('Health Monitor');
  res.status(httpStatus.OK).send('OK');
});

app.get('/api/v2/auth/config', (req, res) => {
  logger.debug('Invoked config');
  res.status(httpStatus.OK).send(JSON.parse(JSON.stringify(process.env)));
});

// app.listen(process.env.PORT, () => {
//   logger.info(`Auth server started at port: ${process.env.PORT}`);
// });

driver(app, false);
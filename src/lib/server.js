'use strict';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './logger';


import loggerMiddleware from './middleware/logger-middleware';
import errorMiddleWare from './middleware/error-middleware';
import authRouter from '../router/auth-router';
import profileRouter from '../router/profile-router';

const app = express();
const PORT = process.env.PORT || 3000;
let server = null;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(loggerMiddleware);
app.use(authRouter);
app.use(profileRouter);

app.all('*', (request, response) => {
  console.log('Returning 404 from the catch-all route'); /* eslint-disable-line */
  return response.sendStatus(404).send('Route Not Registered');
});

app.use(errorMiddleWare);

const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      server = app.listen(PORT, () => {
        console.log('Server is listening on:', PORT); /* eslint-disable-line */
      });
    })
    .catch((err) => {
      throw err;
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close(() => {
        logger.log(logger.INFO, 'Server is off');
      });
    })
    .catch((err) => {
      throw err;
    });
};

export { startServer, stopServer };
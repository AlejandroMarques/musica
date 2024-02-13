const express = require('express');
const cors = require('cors');
const {connection} = require('./database/connection');
const path = require('path');
const dotenv = require('dotenv').config({ path: `${__dirname}/.env` });

const userRouter = require('./routes/user');
const songRouter = require('./routes/song');
const albumRouter = require('./routes/album');
const artistRouter = require('./routes/artist');

const serverUp = () => {
  const app = express();
  const port = process.env.PORT;
  app.use(cors());
  app.use(express.json()); 
  app.use(express.urlencoded({ extended: true }));

  app.get('/api', (req, res) => res.send('Hello World!'));
  app.use('/api/user', userRouter);
  app.use('/api/artist', artistRouter);
  app.use('/api/album', albumRouter);
  app.use('/api/song', songRouter);


  app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await connection();
  });
}

serverUp()
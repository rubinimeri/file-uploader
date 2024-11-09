const express = require('express');
const path = require('path');
const passport = require('./strategies/localStrategy');
const initSession = require('./middleware/initializeSession');
const router = require('./routes/index');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "public")));
app.use(initSession);
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.listen(port, () => console.log(`Listening on port ${port}!`));
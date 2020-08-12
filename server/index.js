require("dotenv").config();
const express = require("express");
const massive = require("massive");
const session = require("express-session");
const app = express();
const { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;
const middle = require('./controllers/middleware')
const authCtrl = require('./controllers/authController')

app.use(express.json());

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

massive({
    connectionString: CONNECTION_STRING,
    ssl: {rejectUnauthorized: false}
}).then(db => {
    app.set('db', db)
    console.log('Database Connected!')
})

app.post('/auth/register', middle.checkUsername, authCtrl.register)
app.post('/auth/login', middle.checkUsername, authCtrl.login)
app.post('/auth/logout', authCtrl.logout)
app.get('/auth/user', authCtrl.getUser)

app.listen(SERVER_PORT, () => console.log(`Here we go on port ${SERVER_PORT}, yeehaw.`))
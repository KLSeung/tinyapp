const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

//require body parser as a dependency to make buffers readable
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

//require cookie parser as a dependency
const cookieParser = require('cookie-parser');

app.use(cookieParser());

//require uuid to create unique ids for account identifiers
const { v4: uuidv4 } = require('uuid');


//Set view engine as ejs
app.set('view engine', 'ejs');


//Global url Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Global user information
const users = {};

//Generates random strings for shortURL
const generateRandomString = () => {
  const alphaNumeric = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += alphaNumeric[Math.round(Math.random() * alphaNumeric.length - 1)];
  }
  return randomString;
};

//Checks if user already exists or if the email or password inputted is blank
const findUserByEmail = (email) => {
  for (let id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//GET root directory
app.get('/', (req, res) => {
  res.send("Hello!");
});

//GET urls to render url list into urls_index
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  console.log(templateVars);
  // let urlList = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//GET new route to render urls_new
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//POST new shortURL - longURL pair onto urlDatabase and redirect to the new shortURL
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});

//GET method for registration page
app.get("/register", (req, res) => {
  let templateVars = {
    user:  users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

//POST method to store user information in unique id
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status('400').send('Email or password cannot be empty!');
  }

  const foundUser = findUserByEmail(email);
  if (foundUser) {
    return res.status('400').send('User with this email address already exists!');
  }

  const uuid = uuidv4().split("-")[2];
  users[uuid]  = {
    email,
    password
  };
  res.cookie('user_id', uuid);
  res.redirect("urls");
});

//GET method for login page
app.get("/login", (req, res) => {
  let templateVars = {
    user:  users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

//GET requested shortURL with its corresponding longURL and render both onto urls_show
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user:  users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

//GET requested shortURL and redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POST request to remove url resource
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

//POST method once user edits the longURL of a pre-existing shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect('/urls');
});

// //POST method for user login to set cookies
// app.post("/login", (req, res) => {
//   res.cookie('username', req.body.username);
//   res.redirect('/urls');
// });

//POST method for user to logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//Server listen to PORT which is 8080
app.listen(PORT, () => {
  console.log(`TinyApp listening on port: ${PORT}`);
});


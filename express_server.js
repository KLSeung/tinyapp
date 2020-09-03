const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

//require body parser as a dependency to make buffers readable
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

//require cookie session as a dependency in order to encrypt cookies
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['asdsafewaffas']
}));

//require uuid to create unique ids for account identifiers
const { v4: uuidv4 } = require('uuid');

//require bcrypt for hashing passwords
const bcrypt = require('bcrypt');

//Set view engine as ejs
app.set('view engine', 'ejs');

//Global url Database
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" , userID: "fa21" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "wd12" }
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

//Import module that returns the user object given the user's email and users database 
const { findUserByEmail } = require('./helpers');

//Filters out the list of urls with the corresponding userID
const urlsForUser = (database, id) => {
  const newUrlDatabase = {};
  for (let url in database) {
    const shortURL = database[url];
    if (shortURL.userID === id) {
      newUrlDatabase[url] = shortURL;
    }
  }
  return newUrlDatabase;
};

//GET root directory
app.get('/', (req, res) => {
  res.send("Hello!");
});

//GET urls to render url list into urls_index
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userURLS = urlsForUser(urlDatabase, userID);
  let templateVars = {
    user: users[userID],
    urls: userURLS
  };
  res.render("urls_index", templateVars);
});

//GET new route to render urls_new
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
  }
  let templateVars = {
    user: users[userID]
  };
  res.render("urls_new", templateVars);
});

//POST new shortURL - longURL pair onto urlDatabase and redirect to the new shortURL
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${randomString}`);
});

//GET method for registration page
app.get("/register", (req, res) => {
  let templateVars = {
    user:  users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

//POST method to store user information in unique id
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status('400').send('Email or password cannot be blank!');
  }

  const foundUser = findUserByEmail(email, users);
  if (foundUser) {
    return res.status('400').send('User with this email address already exists!');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const uuid = uuidv4().split("-")[2];
  users[uuid]  = {
    id: uuid,
    email,
    password: hashedPassword
  };
  req.session.user_id = uuid;
  res.redirect("urls");
});

//GET method for login page
app.get("/login", (req, res) => {
  let templateVars = {
    user:  users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

//POST method for user login to set cookies
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status('403').send("Email or password cannot be blank!");
  }
  
  const foundUser = findUserByEmail(email, users);
  if (foundUser === null) {
    return res.status('403').send("User with this email address does not exist!");
  }
  
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status('403').send("Password does not match email address");
  }

  req.session.user_id = foundUser.id;
  // res.cookie('user_id', foundUser.id);
  res.redirect('/urls');
});

//GET requested shortURL with its corresponding longURL and render both onto urls_show
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  let templateVars = {
    user:  users[userID],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    userID: userID,
    shortURLUser: urlDatabase[shortURL].userID
  };
  res.render("urls_show", templateVars);
});

//GET requested shortURL and redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//POST request to remove url resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status('400').send("You don't have permission to delete this url \n");
  }
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

//POST method once user edits the longURL of a pre-existing shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status('400').send("You don't have permission to edit this url \n");
  }
  urlDatabase[shortURL].longURL = req.body.newLongURL;
  res.redirect('/urls');
});

//POST method for user to logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

//Server listen to PORT which is 8080
app.listen(PORT, () => {
  console.log(`TinyApp listening on port: ${PORT}`);
});


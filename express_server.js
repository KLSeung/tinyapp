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
const urlDatabase = {};

//Global user information
const users = {};

//Import helper functions
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

//GET root directory
app.get('/', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
  }
  res.redirect("/urls");
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
  //Check if user is not logged in
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
  //Add new url with the random string generated as its shortURL and attach the longURL and userID to it
  urlDatabase[randomString] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${randomString}`);
});

//GET method for registration page
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  //Check if user is already logged in
  if (user) {
    res.redirect('/urls');
  }
  let templateVars = {
    user
  };
  res.render("urls_register", templateVars);
});

//POST method to store user information in unique id
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  //Check if user inputted blank email or password
  if (!email || !password) {
    return res.status('400').send('Email or password cannot be blank!');
  }
  //Check if user with the same email address already exists
  const foundUser = findUserByEmail(email, users);
  if (foundUser) {
    return res.status('400').send('User with this email address already exists!');
  }
  //Hash password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);
  //Create uniqueID for each user
  const uuid = uuidv4().split("-")[2];
  users[uuid]  = {
    id: uuid,
    email,
    password: hashedPassword
  };

  //Set user session
  req.session.user_id = uuid;
  res.redirect("urls");
});

//GET method for login page
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  //Check if user is already logged in
  if (user) {
    res.redirect('/urls');
  }
  let templateVars = {
    user
  };
  res.render("urls_login", templateVars);
});

//POST method for user login to set cookies
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //Check if user inputted blank email or password
  if (!email || !password) {
    return res.status('403').send("Email or password cannot be blank!");
  }
  //Check if inputted email address and password combination matches
  const foundUser = findUserByEmail(email, users);
  if (foundUser === null || !bcrypt.compareSync(password, foundUser.password)) {
    return res.status('403').send("Email address and password combination does not match!");
  }
  
  //Set user session
  req.session.user_id = foundUser.id;
  res.redirect('/urls');
});

//GET requested shortURL with its corresponding longURL and render both onto urls_show
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  
  //Check if this shortURL exists
  if (!urlDatabase[shortURL]) {
    return res.status('403').send("This shortURL does not exist!");
  }

  const userID = req.session.user_id;

  let templateVars = {
    user:  users[userID],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    userID,
    shortURLUser: urlDatabase[shortURL].userID,
  };
  res.render("urls_show", templateVars);
});

//GET requested shortURL and redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //Check if this shortURL exists
  if (!urlDatabase[shortURL]) {
    return res.status('403').send("This shortURL does not exist!");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//POST request to remove url resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  //Check if the user has permission to delete the shortURL
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status('400').send("You don't have permission to delete this url \n");
  }
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

//POST method once user edits the longURL of a pre-existing shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  //Check if the user has permission to edit the shortURL
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


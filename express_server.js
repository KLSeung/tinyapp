const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const ejsLint = require('ejs-lint');

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let urlList = { urls: urlDatabase };
  res.render("urls_index", urlList);
});

app.get("/urls/:shortURL", (req, res) => {
  let requestedURL = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", requestedURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port: ${PORT}`);
});


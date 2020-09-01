const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const ejsLint = require('ejs-lint');

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//GET root directory
app.get('/', (req, res) => {
  res.send("Hello!");
});

//GET urls to render url list into urls_index
app.get("/urls", (req, res) => {
  let urlList = { urls: urlDatabase };
  res.render("urls_index", urlList);
});

//GET new route to render urls_new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//GET requested shortURL with its corresponding longURL and render both onto urls_show 
app.get("/urls/:shortURL", (req, res) => {
  let requestedURL = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", requestedURL);
});

//Server listen to PORT which is 8080 
app.listen(PORT, () => {
  console.log(`TinyApp listening on port: ${PORT}`);
});


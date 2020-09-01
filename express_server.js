const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body><p>Hello <b>World</b></p></body></html>\n")
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port: ${PORT}`);
});


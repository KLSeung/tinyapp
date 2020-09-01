const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

//require body parser as a dependency to make buffers readable
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

//Set view engine as ejs
app.set('view engine', 'ejs');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const alphaNumeric = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += alphaNumeric[Math.round(Math.random() * alphaNumeric.length - 1)];
  }
  return randomString;
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

//POST new shortURL - longURL pair onto urlDatabase and redirect to the new shortURL
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;  // Log the POST request body to the console
  res.redirect(`/urls/${randomString}`);         // Respond with 'Ok' (we will replace this)
});


//GET requested shortURL with its corresponding longURL and render both onto urls_show
app.get("/urls/:shortURL", (req, res) => {
  let requestedURL = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", requestedURL);
});

//GET requested shortURL and redirect to the longURL 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


//Server listen to PORT which is 8080
app.listen(PORT, () => {
  console.log(`TinyApp listening on port: ${PORT}`);
});


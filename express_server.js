const express = require("express");
const app = express();

//use body-parser to translate body buffer into readable string data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080; // default port 8080

//set view engine to ejs
app.set("view engine", "ejs");

const urlDatabase = { //list of urls
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => { //  / is the root path
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortenedURL = generateUid(); //get the randomized key for the DB 
  const longURL = req.body.longURL; //get the value for the new DB 
  urlDatabase[shortenedURL] = longURL; //add to the DB
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect('/urls'); // go back to the /urls route
});

app.get("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL; //use req.params to get string of :shortURL in the url, whatever the input, stored it in short
  const templateVars = { shortURL: short, longURL: urlDatabase[short] }; //the short form is short, the long url is the value of the key "short" in the url DB

  //res.send(req.params);
  res.render("urls_show", templateVars);
});
/*
app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});
*/
/*
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //sent a response to be rendering in client broswer as html
});
*/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generates a unique id for shortened urls
function generateUid() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

const express = require("express");
const app = express();
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

app.get("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const templateVars = { shortURL: short, longURL: urlDatabase[short]/* What goes here? */ };
  console.log("Helllllllllo", templateVars);
  console.log("Req Params", req.params);
  console.log(short);

  //res.send(req.params);
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //sent a response to be rendering in client broswer as html
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
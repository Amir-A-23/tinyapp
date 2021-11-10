const express = require("express");
const app = express();

//use body-parser to translate body buffer into readable string data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

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
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
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
  const templateVars = { shortURL: short, longURL: urlDatabase[short], username: req.cookies["username"]}; //the short form is short, the long url is the value of the key "short" in the url DB

  //res.send(req.params);
  res.render("urls_show", templateVars);
});

//Redirect short urls to the website of the long url address
app.get("/u/:shortURL", (req, res) => {
  //get the shorturl key
  //find the related value in that key
  //set it to the long value
  const shortURLKey = req.params.shortURL; //set the key as the shortURL in the parameters
  //console.log('FOOBAR: ', shortURLKey);
  const longURL = urlDatabase[shortURLKey]; //get the value of the key
  //console.log(urlDatabase[shortURLKey]);
  res.redirect(longURL); 
});

/******UPDATE ROUTE*********/

app.get('/urls/:shortURL', (req, res) => {
  
  const shortURL = req.params;

  if (!urlDatabase[shortURL]) {

    res.send("sorry that shortURL does not exist");
    return;
  }
  
  const templateVars = {longURL: urlDatabase[shortURL], username: req.cookies["username"]};
  
  res.render('urls_show', templateVars);
});


// UPDATE => update the info in the db
app.post('/urls/:shortURL', (req, res) => {

  // extract the short form url
  const shortURL = req.params.shortURL;

  // extract the long form url
  const longURL = req.body.longURL;
  console.log(longURL);

  // update the db

  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);

  // redirect
  res.redirect('/urls');

});

/******END OF UPDATE ROUTE*********/




/*******DELETE ROUTE*******/
app.post('/urls/:shortURL/delete', (req, res) =>{

  // extract the id
  const shortURLID = req.params.shortURL;

  //delete url from DB
  delete urlDatabase[shortURLID];
  console.log('deleted');
  res.redirect('/urls');

});
/*******END OF DELETE ROUTE*******/


/*****LOGIN ROUTE******/

app.post('/login', (req, res) => {

  //const submittedName = req.body.username;
  res.cookie('username', req.body.username);

  res.redirect('/urls');
})




/*****END LOGIN ROUTE******/

/*****LOGIN OUT ROUTE******/

app.post('/logout', (req, res) => {

  //const submittedName = res.body.username;
  res.clearCookie('username');

  res.redirect('/urls');
})

//


/*****END LOGIN OUT ROUTE******/
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

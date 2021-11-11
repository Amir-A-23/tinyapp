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



const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => { //  / is the root path
  res.send("Hello!");
});

app.get("/urls", (req, res) => {

  const cookieId = req.cookies["username"];
  let user;
  if(cookieId) {
     user = validateCookie(cookieId, users);
  }
  const templateVars = {urls: urlDatabase, user};
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => {
  const cookieId = req.cookies["username"];
  let user;
  if(cookieId) {
     user = validateCookie(cookieId, users);
  }
  res.render("urls_new", user);
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
  const cookieId = req.cookies["username"];
  let user;
  if(cookieId) {
     user = validateCookie(cookieId, users);
  }
  const templateVars = { shortURL: short, longURL: urlDatabase[short], user}; //the short form is short, the long url is the value of the key "short" in the url DB

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
  const cookieId = req.cookies["username"];
  let user;
  if(cookieId) {
     user = validateCookie(cookieId, users);
  }
  const templateVars = {longURL: urlDatabase[shortURL], user};
  
  res.render('urls_show', templateVars);
});



// UPDATE => update the info in the db
app.post('/urls/:shortURL', (req, res) => {

  // extract the short form url
  const shortURL = req.params.shortURL;

  // extract the long form url
  const longURL = req.body.longURL;
  //console.log(longURL);

  // update the db

  urlDatabase[shortURL] = longURL;
  //console.log(urlDatabase);

  // redirect
  res.redirect('/urls');

});

/******END OF UPDATE ROUTE*********/

/*******DELETE ROUTE*******/
app.post('/urls/:shortURL/delete', (req, res) =>{

  urlsID = req.params.shortURL;

  //delete url from DB
  delete urlDatabase[shortURLID];
  //console.log('deleted');
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
});

/*****END LOGIN OUT ROUTE******/

/****REGISTER ROUTE ****/
app.get('/register', (req, res) => {
  //res.clearCookie('username');
  const cookieId = req.cookies["username"];
  let user;
  if(cookieId) {
     user = validateCookie(cookieId, users);
  }
  const templateVars = {user};
res.render('register', templateVars);
})

app.post('/register', (req, res) => {
  const userId = generateUid();
  const userEmail = req.body.email;
  const password = req.body.password;
  if(userEmail === '' || password === '') {
    res.status(400);
    res.send('Invalid email or password');
    return;
  }
  const user = getUserByEmail(userEmail, users);

  if(user) {
    res.status(400);
    res.send('Error: Email is already in use!');
    return;
  }
  
  const newUser = {
    id: userId, 
    email: userEmail, 
    password: password
  };

  users[userId] = newUser;


  res.cookie('username', userId);
  //console.log(users);
  res.redirect('/urls');
});

/****END REGISTER ROUTE ****/
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




//*************************************************FUNCTIONS****************************************************/

// generates a unique id for shortened urls
function generateUid() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function validateCookie(cookieId, users) {
  const user = users[cookieId];
  return user;

}


function getUserByEmail(email, users) {
  for(let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
}

//in every get get the cookie value === userID, put into variable

//use that userID variable to find the key of the object we want, looping
//pass that specific key object to templateVars
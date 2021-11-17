const express = require("express");
const app = express();

//use body-parser to translate body buffer into readable string data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["The most secure cookie ever","key123"]
}));

const bcrypt = require('bcryptjs');

const { urlDatabase, users } = require('./data/userData');
const { generateUid, validateCookie, getUserByEmail, validateUrls } = require('./helpers/helperFunctions');

const PORT = 8080; // default port 8080

//set view engine to ejs
app.set("view engine", "ejs");

/*****************ROUTES***************/
app.get("/", (req, res) => { //  / is the root path
  return res.redirect("/urls");
});

app.get("/urls", (req, res) => {

  const cookieId = req.session.user_id;
  let user;
  let urls;
  //if cookie exists make sure it is the correct user
  if (cookieId) {
    user = validateCookie(cookieId, users);
    urls = validateUrls(cookieId, urlDatabase);
    
    const templateVars = {urls: urls, user};
    return res.render("urls_index", templateVars);
  }
  return res.redirect("/logged_out");
});

//when adding new long url, check if logged in
app.get("/urls/new", (req, res) => {
  const cookieId = req.session.user_id;
  let user;
  if (cookieId) { //if logged in
    user = validateCookie(cookieId, users);
    const templateVars = { user };
    return res.render("urls_new", templateVars);
  }
  //if not logged in redirect
  return res.redirect('/logged_out');
});

app.post("/urls", (req, res) => {
  const cookieId = req.session.user_id;
  if (!cookieId) {
    return res.send('ERROR Please login First');
  }
  const shortenedURL = generateUid(); //get the randomized key for the DB
  urlDatabase[shortenedURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  return res.redirect(`/urls/${shortenedURL}`); // go back to the /urls route
});


//Redirect short urls to the website of the long url address
app.get("/u/:shortURL", (req, res) => {
  
  //get the shorturl key
  //find the related value in that key
  //set it to the long value
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("ERROR: Enter a valid url");
  }

  const longURL = urlDatabase[req.params.shortURL].longURL; //get the value of the key
  const google = 'http://www.google.com';
  return res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const cookieId = req.session.user_id;
  let user;
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!user_id) {
    res.status(403);
    return res.send('ERROR: Please login First');
  }
  if (!urlDatabase[shortURL]) {
    res.status(403);
    return res.send('ERROR: shortURL not found');
  }
  if (user_id !== urlDatabase[shortURL].userID) {
    res.status(403);
    return res.send('ERROR: ACCESS DENIED');
  }
  //if the short url does not exist in the db or match
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("Please login to access urls");
  }
  //if short url matched check if user is logged in
  if (cookieId) {
    user = validateCookie(cookieId, users);
    const templateVars = { user, shortURL: req.params.shortURL, urls: urlDatabase}; //the short form is short, the long url is the value of the key "short" in the url DB
  
    //res.send(req.params);
    return res.render("urls_show", templateVars);
  }
  //if not logged in
  return res.redirect("logged_out");
});

/******UPDATE ROUTE*********/

// UPDATE => update the info in the db
app.post('/urls/:shortURL', (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!user_id) {
    res.status(403);
    return res.send('ERROR: Please login First');
  }
  if (user_id !== urlDatabase[shortURL].userID) {
    res.status(403);
    return res.send('ERROR: URL NOT FOUND');
  }
  // extract the long form url
  const longURL = req.body.longURL;
  // update the db
  urlDatabase[shortURL].longURL = longURL;
  // redirect
  return res.redirect('/urls');

});

/******END OF UPDATE ROUTE*********/

/*******DELETE ROUTE*******/
app.post('/urls/:shortURL/delete', (req, res) =>{

  const shortURLID = req.params.shortURL;
  const user_id = req.session.user_id;
  // Testing user ability to delete
  if (!user_id) {
    res.status(403);
    return res.send('ERROR: Please login First');
  }
  if (user_id !== urlDatabase[shortURLID].userID) {
    res.status(403);
    return res.send('ERROR: URL NOT FOUND');
  }
  //delete url from DB
  delete urlDatabase[shortURLID];

  return res.redirect('/urls');

});
/*******END OF DELETE ROUTE*******/

/*****LOGIN ROUTE******/
app.get('/login', (req, res) => {
  let user;
  //urls = validateUrls(cookieId, urlDatabase);
  const templateVars = {user};
  //res.render("urls_index", templateVars);
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    res.status(403);
    return res.send('ERROR: USER NOT FOUND');
  }
  //compare hashed password to the password thats in the db that is already hashed
  if (!bcrypt.compareSync(password, foundUser.password)) {
    res.status(403);
    return res.send('ERROR: INCORRECT PASSWORD');
  }
  //res.cookie('user_id', foundUser.id);
  req.session.user_id = foundUser.id;

  //res.cookie('user_password', foundUser.password);
  req.session.user_password = foundUser.password;

  return res.redirect('/urls');
});
/*****END LOGIN ROUTE******/


/*****LOGOUT ROUTE******/
//app.get to read the information
app.get("/logged_out", (req, res) => {
  const cookieID = req.session.user_id;
  let user;
  let urls;
  if (cookieID) {
    user = validateCookie(cookieID, users);
    urls = validateUrls(cookieID, urlDatabase);
  }
  const templateVars = { user, urls: urls };
  return res.render("logged_out", templateVars);
});

app.post('/logout', (req, res) => {
  //deleting cookie session
  req.session = null;
  //req.session.user_password = null;


  return res.redirect('/login');
});

/*****END LOGOUT ROUTE******/

/****REGISTER ROUTE ****/
app.get('/register', (req, res) => {
  //check userid and send it to header to allow header to check if user is true
  const cookieId = req.session.user_id;
  let user;
 
  if (cookieId) {
    user = validateCookie(cookieId, users);
  }
  const templateVars = {user};
  return res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const userId = generateUid();
  const userEmail = req.body.email;
  const password = req.body.password;
   
  //if not a correct format for a email or password
  if (!userEmail || !password) {
    res.status(400);
    return res.send('Invalid email or password');
  }
  const user = getUserByEmail(userEmail, users);
  
  //if trying to register with an email that is already in the db
  if (user) {
    res.status(400);
    return res.send('Error: Email is already in use!');
  }

  //encrypt the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  //populate new user
  const newUser = {
    id: userId,
    email: userEmail,
    password: hashedPassword
  };

  //add user to user DB
  users[userId] = newUser;
  //res.cookie('user_id', userId);
  req.session.user_id = userId;

  //res.cookie('user_password', hashedPassword);
  req.session.user_password = hashedPassword;

  return res.redirect('/urls');
});

/****END REGISTER ROUTE ****/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


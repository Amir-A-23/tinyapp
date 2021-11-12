const express = require("express");
const app = express();

//use body-parser to translate body buffer into readable string data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//const cookieParser = require("cookie-parser");
//app.use(cookieParser());

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
  res.send("Hello!");
});

app.get("/urls", (req, res) => {

  const cookieId = req.session.user_id;
  let user;
  let urls;
  if (cookieId) {
    user = validateCookie(cookieId, users);
    urls = validateUrls(cookieId, urlDatabase);
  const templateVars = {urls: urls, user};
  res.render("urls_index", templateVars);
  }
  res.redirect("logged_out");
});


app.get("/urls/new", (req, res) => {
  const cookieId = req.session.user_id;
  let user;
  if (cookieId) {
    user = validateCookie(cookieId, users);
    const templateVars = { user };
    res.render("urls_new", templateVars);
  }
  res.redirect('/login');
});

app.post("/urls", (req, res) => {
  const cookieId = req.session.user_id;
  if(!cookieId){
    res.send('ERROR Please login First');
    return;
  }
  const shortenedURL = generateUid(); //get the randomized key for the DB
  urlDatabase[shortenedURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  console.log('DB======', urlDatabase);
  res.redirect(`/urls/${shortenedURL}`); // go back to the /urls route
});


//Redirect short urls to the website of the long url address
app.get("/u/:shortURL", (req, res) => {
  
  //get the shorturl key
  //find the related value in that key
  //set it to the long value
  if(!urlDatabase[req.params.shortURL]) {
    return res.send("ERRORRR =>>> Enter a valid url");
  }

  const longURL = urlDatabase[req.params.shortURL].longURL; //get the value of the key

  //console.log(urlDatabase[shortURLKey]);
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const cookieId = req.session.user_id;
  let user;
  if (!urlDatabase[req.params.shortURL]) {

    res.send("sorry that shortURL does not exist");
    return;
  }
  if (cookieId) {
    user = validateCookie(cookieId, users);
    const templateVars = { user, shortURL: req.params.shortURL, urls: urlDatabase}; //the short form is short, the long url is the value of the key "short" in the url DB
  
    //res.send(req.params);
    res.render("urls_show", templateVars);
  }
  res.redirect("logged_out");
});






/******UPDATE ROUTE*********/

// UPDATE => update the info in the db
app.post('/urls/:shortURL', (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if(!user_id){
    res.status(403);
    res.send('ERROR: Please login First');
    return;
  }
  if(user_id !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send('ERROR: URL NOT FOUND');
    return;
  }
  // extract the short from url

  // extract the long form url
  const longURL = req.body.longURL;
  //console.log('Long URL: ', longURL);

  // update the db

  urlDatabase[shortURL].longURL = longURL;
  //console.log(urlDatabase);

  // redirect
  res.redirect('/urls');

});

/******END OF UPDATE ROUTE*********/







/*******DELETE ROUTE*******/
app.post('/urls/:shortURL/delete', (req, res) =>{

  const shortURLID = req.params.shortURL;
  const user_id = req.session.user_id;
  // Testing user ability to delete
  if(!user_id){
    res.status(403);
    res.send('ERROR: Please login First');
    return;
  }
  if(user_id !== urlDatabase[shortURLID].userID) {
    res.status(403);
    res.send('ERROR: URL NOT FOUND');
    return;
  }
  //delete url from DB
  delete urlDatabase[shortURLID];

  res.redirect('/urls');

});
/*******END OF DELETE ROUTE*******/








/*****LOGIN ROUTE******/
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    res.status(403);
    res.send('ERROR: USER NOT FOUND');
    return;
  }

//get the password from the obj
  //const user = validateCookie(cookieId, users);
  //console.log(hashedPassword);

  //if (bcrypt.hashSync("purple-monkey-dinosaur") === hashedPassword)) { ... }


  if (!bcrypt.compareSync(password, foundUser.password)) {
    res.status(403);
    res.send('ERROR: INCORRECT PASSWORD');
    return;
  }
  res.cookie('user_id', foundUser.id);
  req.session.user_id = foundUser.id;

  //res.cookie('user_password', foundUser.password);
  req.session.user_password = foundUser.password

  res.redirect('/urls');
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
  res.render("logged_out", templateVars);
});


app.post('/logout', (req, res) => {

  //const submittedName = res.body.username;
  //res.clearCookie('user_id');
  req.session.user_id = null;
  //res.clearCookie('user_password');
  req.session.user_password = null;


  res.redirect('/login');
});

/*****END LOGOUT ROUTE******/















/****REGISTER ROUTE ****/
app.get('/register', (req, res) => {
  //res.clearCookie('username');
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
   
  if (!userEmail || !password) {
    res.status(400);
    res.send('Invalid email or password');
    return;
  }
  const user = getUserByEmail(userEmail, users);
  
  if (user) {
    res.status(400);
    res.send('Error: Email is already in use!');
    return;
  }


  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: userId,
    email: userEmail,
    password: hashedPassword
  };

  users[userId] = newUser;
  //res.cookie('user_id', userId);
  req.session.user_id = userId;

  //res.cookie('user_password', hashedPassword);
  req.session.user_password = hashedPassword;

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


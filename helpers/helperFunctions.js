// generates a unique id for shortened urls
function generateUid() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

//in every get get the cookie value === userID, put into variable
//use that userID variable to find the key of the object we want, looping
//pass that specific key object to templateVars
function validateCookie(cookieId, users) {
  const user = users[cookieId];
  return user;

}

function getUserByEmail(email, users) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
};

function validateUrls(cookieId, urls) {
  const matchUrl = {};
  for (let url in urls) {
    //console.log(url);
    if (urls[url].userID === cookieId) {
      matchUrl[url] = urls[url];
    }
  }
  return matchUrl;
};

module.exports = { generateUid, validateCookie, getUserByEmail, validateUrls };
const { assert } = require('chai');

const { getUserByEmail } = require('../helpers/helperFunctions.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers).id;
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedUserID);
  });
  it('should return a undefined with invalid email', function() {
    const user = getUserByEmail("aaaa@bbbbb.com", testUsers);
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedUserID);
  });
});
const { assert } = require('chai');

const { findUserByEmail } = require('../helpers');

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

describe('findUserByEmail', () => {
  it('Should return a user with a valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";

    assert.strictEqual(user.id, expectedOutput);
  });
  
  it('Should return null if a user with the given email does not exist', () => {
    const user = findUserByEmail("userrrr@example.com", testUsers);
    
    assert.isNull(user);
  });
});
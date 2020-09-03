//Returns the user object if the email matches the user in the database
const findUserByEmail = (email, database) => {
  for (let id in database) {
    const user = database[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//Generates random strings for shortURL
const generateRandomString = () => {
  const alphaNumeric = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += alphaNumeric[Math.round(Math.random() * alphaNumeric.length - 1)];
  }
  return randomString;
};

//Filters out the list of urls with the corresponding userID
const urlsForUser = (database, id) => {
  const newUrlDatabase = {};
  for (let url in database) {
    const shortURL = database[url];
    if (shortURL.userID === id) {
      newUrlDatabase[url] = shortURL;
    }
  }
  return newUrlDatabase;
};


module.exports = { findUserByEmail, generateRandomString, urlsForUser };


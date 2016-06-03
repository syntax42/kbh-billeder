var REDIRECTION_URL = 'http://www.kbharkiv.dk/';
var LOCALSTORAGE_FIELD = 'password';

if (typeof(Storage) !== 'undefined') {
  var msg = ['Sitet er desværre ikke lanceret endnu - for at kunne se det skal',
             'du kende et kodeord'];

  while(localStorage.getItem(LOCALSTORAGE_FIELD) !== 'edagleda') {
    var password = prompt(msg.join(' '));
    localStorage.setItem(LOCALSTORAGE_FIELD, password.split('').reverse().join(''));
  }
} else {
  var msg = ['Sitet er desværre ikke lanceret endnu - for at kunne se det skal',
             'du benytte en moderne browser.'];
  alert(msg.join(' '));
  location.href = REDIRECTION_URL;
}

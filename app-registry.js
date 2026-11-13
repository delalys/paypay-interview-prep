// Built-in decks call registerDeck() from decks/*.js.
// To add a theme permanently: create decks/<name>.js and add a <script> tag in index.html.
window.BUILTIN_DECKS = [];
window.registerDeck = function (deck) {
  window.BUILTIN_DECKS.push(deck);
};

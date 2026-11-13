# PayPay Senior Engineer — Interview Flashcards

Static flashcard app to prepare for a senior engineer interview at PayPay
(JavaScript, React, system design, payments, experience, repo architecture).

Live: https://delalys.github.io/paypay-interview-prep/

## Features

- Themes (decks) you can toggle, with mastery and due counts
- Spaced repetition (Leitner boxes): **Again / Hard / Good**, keyboard `Space`, `1`, `2`, `3`
- Browse & search all cards
- Add your own themes and cards in the browser (stored in localStorage), export/import JSON

## Add a theme permanently

1. Create `decks/<name>.js`:

   ```js
   registerDeck({
     id: "my-theme",
     title: "My theme",
     description: "…",
     cards: [{ q: "Question?", a: "Answer with `code`, **bold**, - bullets, ~~~ code blocks ~~~" }],
   });
   ```

2. Add `<script src="decks/<name>.js"></script>` in `index.html` before `app.js`.

## Run locally

Open `index.html` in a browser — no build step.

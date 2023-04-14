const letters = document.querySelectorAll(".key-button");
const boxes = document.querySelectorAll(".letter-box");
const loading = document.querySelector(".loading");

let win = false;
let lose = false;

let numberOfLetters = 0;
let currentWord = 1;

async function validateWord(valid) {
  appearOrDisappearLoading();
  const tryToValidate = {
    word: `${valid}`,
  };
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tryToValidate),
  };
  const response = await fetch(
    "https://words.dev-apis.com/validate-word",
    options
  );
  const processedResponse = await response.json();
  appearOrDisappearLoading();
  return processedResponse.validWord;
}

async function init() {
  // Getting the word of the day
  const promiseWord = await fetch("https://words.dev-apis.com/word-of-the-day");
  const processedWord = await promiseWord.json();

  // Getting the keyboard and virtual keyboard inputs

  document.addEventListener("keydown", function onPressKey(event) {
    const key = event.key;
    handleInputs(key, processedWord.word.toUpperCase());
  });

  for (let i = 0; i < letters.length; i++) {
    letters[i].addEventListener("click", function onPressButton(event) {
      const button = event.target.dataset.key;
      handleInputs(button, processedWord.word.toUpperCase());
    });
  }
}

// Handle letters
function handleInputs(value, wordOfTheDay) {
  if (!win && !lose) {
    if (value == "Enter") {
      enterTyped(wordOfTheDay);
    } else if (value == "Backspace") {
      backspaceTyped();
    } else if (isLetter(value)) {
      letterTyped(value);
    } else {
      // Numbers and others characters, do nothing
    }
  }
}

function letterTyped(letter) {
  if (
    numberOfLetters % 5 != 0 ||
    numberOfLetters == 0 ||
    numberOfLetters / 5 < currentWord
  ) {
    numberOfLetters++;
  }
  document.getElementById("letter-" + numberOfLetters).innerText = letter;
  addLetterAnimation();
}

function backspaceTyped() {
  if (numberOfLetters != 0) {
    removeLetterAnimation();
    if (numberOfLetters % 5 != 0 || numberOfLetters / currentWord === 5) {
      document.getElementById("letter-" + numberOfLetters).innerText = "";
      numberOfLetters--;
    }
  }
}

function enterTyped(wordOfTheDay) {
  let comparativeWord = "";
  let index;
  if (numberOfLetters < 5) {
    index = 1;
  } else {
    index = numberOfLetters - 4;
  }
  // Making the letters become a word
  for (index; index <= numberOfLetters; index++) {
    comparativeWord += document.getElementById("letter-" + index).innerText;
  }

  validateWord(comparativeWord).then((isValid) => {
    if (isValid) {
      validWordTyped(wordOfTheDay, comparativeWord);
    } else {
      invalidWordTyped();
    }
  });
}

function isLetter(key) {
  return /^[a-zA-Z]$/.test(key);
}

// Handle words

function repeatedLettersCouter(word) {
  // This function turns the word into an objectturns the word into an object, counting every time that a letter appears in the word
  let letters = new Object();
  for (let i = 0; i < word.length; i++) {
    let counter = 1;
    for (let j = i + 1; j < word.length; j++) {
      if (word[i] == word[j]) {
        counter++;
      }
    }
    if (word[i] in letters) {
      continue;
    } else {
      letters[word[i]] = counter;
    }
  }
  return letters;
}

function validWordTyped(wordOfTheDay, comparativeWord) {
  let position = 0;
  wotdObj = repeatedLettersCouter(wordOfTheDay);
  cwObj = repeatedLettersCouter(comparativeWord);

  for (let i = numberOfLetters - 4; i <= numberOfLetters; i++) {
    const typedCurrentLetter = document.getElementById("letter-" + i);
    typedCurrentLetter.style.color = "#fff";
    for (let j = 0 - 5; j < 5; j++) {
      // Correct letter in th correct place
      if (typedCurrentLetter.innerText === wordOfTheDay[j] && position === j) {
        typedCurrentLetter.style.backgroundColor = "#006400";
        cwObj[typedCurrentLetter.innerText]--;
        wotdObj[typedCurrentLetter.innerText]--;
      } else if (
        typedCurrentLetter.innerText != wordOfTheDay[j] &&
        position === j
      ) {
        typedCurrentLetter.style.backgroundColor = "#888888";
      }
    }
    position++;
    if (typedCurrentLetter.innerText in wotdObj) {
      if (
        cwObj[typedCurrentLetter.innerText] > 0 &&
        wotdObj[typedCurrentLetter.innerText] > 0
      ) {
        typedCurrentLetter.style.backgroundColor = "#daa520";
        cwObj[typedCurrentLetter.innerText]--;
        wotdObj[typedCurrentLetter.innerText]--;
      }
    }
  }

  if (wordOfTheDay == comparativeWord) {
    win = true;
    winEffect();
    alert("You win!!");
  } else {
    currentWord++;
    if (currentWord == 7) {
      lose = true;
      alert("You lose!!");
    }
  }
}

function invalidWordTyped() {
  let flash = numberOfLetters;
  do {
    const animate = document.getElementById("letter-" + flash);
    animate.style.animation = "";
    setTimeout(() => (animate.style.animation = "flash 1s ease"), 5);
    flash--;
  } while (flash % 5 != 0);
}

//Others Css effects
function winEffect() {
  document.querySelector(".wordle-title").classList.add("win-animation");
}

function appearOrDisappearLoading() {
  let visibility = document.querySelector(".loading").style.visibility;
  if (visibility == "hidden") {
    document.querySelector(".loading").style.visibility = "visible";
  } else {
    document.querySelector(".loading").style.visibility = "hidden";
  }
}

function removeLetterAnimation() {
  const animate = document.getElementById("letter-" + numberOfLetters);
  animate.style.animation = "";
  setTimeout(() => (animate.style.animation = "shrinks 0.8s ease"), 5);
}

function addLetterAnimation() {
  const animate = document.getElementById("letter-" + numberOfLetters);
  animate.style.animation = "";
  setTimeout(() => (animate.style.animation = "stretch 0.8s ease"), 5);
}

init();

let win = false;
let lose = false;
let currentLetter;
let currentLine = 1;
let numberOfLetters = 0;

const repeatedLettersCouter = (word) => {
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
};

//CSS
const winEffect = () => {
  document.querySelector(".wordle-title").classList.add("win-animation");
};

const invalidWordTyped = () => {
  let flash = numberOfLetters;
  do {
    const animate = document.getElementById("letter-" + flash);
    animate.style.animation = "";
    setTimeout(() => (animate.style.animation = "flash 1s ease"), 5);
    flash--;
  } while (flash % 5 != 0);
};

const validWordTyped = (wordOfTheDay, comparativeWord) => {
  let position = 0;
  wotdObj = repeatedLettersCouter(wordOfTheDay);
  cwObj = repeatedLettersCouter(comparativeWord);

  for (let i = numberOfLetters - 4; i <= numberOfLetters; i++) {
    const typedCurrentLetter = document.getElementById("letter-" + i);
    typedCurrentLetter.style.color = "#fff";
    for (let j = 0 - 5; j < 5; j++) {
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
};

const appearOrDisappearLoading = () => {
  let visibility = document.querySelector(".loading").style.visibility;
  if (visibility == "hidden") {
    document.querySelector(".loading").style.visibility = "visible";
  } else {
    document.querySelector(".loading").style.visibility = "hidden";
  }
};

//GET and POST
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

async function compareWord() {
  appearOrDisappearLoading();
  const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
  const processedResponse = await promise.json();
  appearOrDisappearLoading();
  return processedResponse.word.toUpperCase();
}

//Key type functions
const lettersTyped = (letter) => {
  if (
    numberOfLetters % 5 != 0 ||
    numberOfLetters == 0 ||
    numberOfLetters / 5 < currentLine
  ) {
    numberOfLetters++;
  }
  currentLetter = document.getElementById("letter-" + numberOfLetters);
  currentLetter.innerText = letter.key;
};

const backspaceTyped = () => {
  if (numberOfLetters != 0) {
    if (numberOfLetters % 5 != 0 || numberOfLetters / currentLine === 5) {
      currentLetter = document.getElementById("letter-" + numberOfLetters);
      currentLetter.innerText = "";
      numberOfLetters--;
    }
  }
};

const enterTyped = () => {
  let comparativeWord = "";
  let i = numberOfLetters - 4;
  if (i < 1) {
    i = 1;
  }
  for (i; i <= numberOfLetters; i++) {
    comparativeWord += document.getElementById("letter-" + i).innerText;
  }
  validateWord(comparativeWord).then((isValid) => {
    if (isValid) {
      compareWord().then((wordOfTheDay) => {
        validWordTyped(wordOfTheDay, comparativeWord);
        if (wordOfTheDay === comparativeWord) {
          win = true;
          winEffect();
          alert("You win!!");
        } else {
          currentLine++;
          if (currentLine === 7) {
            lose = true;
            alert("You lose!!");
          }
        }
      });
    } else {
      invalidWordTyped();
    }
  });
};

//Key detect function
document.onkeydown = function (e) {
  if (!win && !lose) {
    if (e.keyCode >= 65 && e.keyCode <= 90 /*LETTERS*/) {
      lettersTyped(e);
    } else if (e.keyCode == 8 /*BACKSPACE*/) {
      backspaceTyped();
    } else if (e.keyCode == 13 /*ENTER*/) {
      enterTyped();
    } else {
      return;
    }
  } else {
  }
};

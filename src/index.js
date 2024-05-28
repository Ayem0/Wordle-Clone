const lettersUpperCase = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const lettersLowerCase = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const alphabet = lettersUpperCase.concat(lettersLowerCase);
const nbOfTry = 6;
var secretWord;
var currentRow = 0;
var currentCell = 0;
var wordKeyArray = {};
var wordEmptyKeyArray = {};
var answer = "";
var answers = [];
var gameOver = false;
let enterKeyPressed = false;

getRandomWord();

async function getRandomWord() {
    try {
        const apiUrl = 'https://random-word-api.vercel.app/api?words=1';
        const response = await fetch(apiUrl);
        const data = await response.json();
        secretWord = data[0].toUpperCase();
        // secretWord = ""; CHOISIR LE MOT SECRET ICI POUR DEBUG
        console.log(secretWord);
        createBoard(secretWord, nbOfTry);
        createKeyArray(secretWord);
        createEmptyKeyArray(secretWord);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
}

function createBoard(secretWord, nbEssai) {
    const div = document.getElementById("table");
    const table = document.createElement("table");
    table.classList.add("table");
    for (let i = 0; i < nbEssai; i++) {
        const row = document.createElement("tr");
        row.classList.add(i);
        for (let j = 0; j < secretWord.length; j++) {
            const cell = document.createElement("td");
            cell.classList.add(i + '-' + j, 'cell');
            row.appendChild(cell); 
        }
        table.appendChild(row); 
    }
    div.appendChild(table); 
}

async function checkIfWordExist(word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return false;
        }
        else {
            return true;
        }
    } catch (error) {
        return false;
        console.error('Erreur lors de la récupération des données:', error);
    }
}

document.addEventListener('keyup', function(event) {
    if (alphabet.includes(event.key) && gameOver != true && currentCell < secretWord.length) {
        const cellToTest = document.getElementsByClassName(currentRow + '-' + currentCell)[0];
        if (cellToTest.innerText == "") {
            cellToTest.innerText = event.key.toUpperCase();
            cellToTest.classList.add('full');
        }
        if ( currentCell != secretWord.length-1) {
            currentCell++;
        }
    }
    if (event.key == "Enter" && !enterKeyPressed && gameOver != true) {
        enterKeyPressed = true;
        const cellToTest = document.getElementsByClassName(currentRow + '-' + currentCell)[0];
        if (currentCell == secretWord.length-1 && cellToTest.innerText != "" && gameOver != true) {
            createAnswer();
            checkIfWordExist(answer)
            .then(exists => {
                if (exists) {
                    answers.push(answer);
                    update(secretWord, answer);
                    answer = "";
                    setTimeout(function() {
                        enterKeyPressed = false;
                    }, 600);
                } else {
                    answer = "";
                    const alert = document.getElementById("alert");
                    const p = document.createElement("p");
                    const rowToShake = document.getElementsByClassName(currentRow)[0];
                    rowToShake.classList.add('shake-row');
                    p.classList.add('alert-word');
                    p.innerText = "Word is not in the list.";
                    alert.appendChild(p);
                    setTimeout(function() {
                        alert.removeChild(p);
                        rowToShake.classList.remove('shake-row');
                        enterKeyPressed = false;
                    }, 600);
                }
            })
            .catch(error => {
                answer = "";
                const alert = document.getElementById("alert");
                const p = document.createElement("p");
                const rowToShake = document.getElementsByClassName(currentRow)[0];
                rowToShake.classList.add('shake-row');
                p.classList.add('alert-word');
                p.innerText = "Word is not in the list.";
                alert.appendChild(p);
                setTimeout(function() {
                    alert.removeChild(p);
                    rowToShake.classList.remove('shake-row');
                    enterKeyPressed = false;
                }, 600);
                console.error('Erreur lors de la vérification du mot:', error);
            });
        } else {
            const alert = document.getElementById("alert");     
            const p = document.createElement("p");
            p.classList.add('alert-word');
            p.innerText = "Word is too short.";
            const rowToShake = document.getElementsByClassName(currentRow)[0];
            rowToShake.classList.add('shake-row');
            alert.appendChild(p); 
            setTimeout(function() {
                alert.removeChild(p);
                enterKeyPressed = false;
                rowToShake.classList.remove('shake-row');
            }, 600);
        }
        return;
    }
    if (event.key == "Backspace") {
        if (gameOver != true) { 
            const cellToTest = document.getElementsByClassName(currentRow + '-' + currentCell)[0];
            if (currentCell != 0 && cellToTest.innerText == "") {
                currentCell--;
                const cellToDelete = document.getElementsByClassName(currentRow + '-' + currentCell)[0];
                cellToDelete.innerText = "";
                cellToDelete.classList.remove('full');
            }
            else {
                cellToTest.innerText = "";
                cellToTest.classList.remove('full');
            }
        }
    }
});

function update(secretWord, answer)  {
    let succes = 0;
    let testArray = Object.assign({}, wordKeyArray);
    let secondArray = Object.assign({}, wordEmptyKeyArray);
    for (let i = 0; i < secretWord.length; i++) {
        if (answer[i] == secretWord[i]) {
            secondArray[i] = "correct";
            testArray[answer[i]]--;
            succes++;
        }
    }
    for (let i = 0; i < secretWord.length; i++) {
        setTimeout(function() {
            if (answer[i] != secretWord[i]) {
                if (answer[i] in testArray && testArray[answer[i]] > 0) {   
                    secondArray[i] = "present";             
                    testArray[answer[i]]--;
                } 
                else {
                    secondArray[i] = "absent";
                }
            }
            const cellToTransform = document.getElementsByClassName(currentRow + '-' + i)[0];
            const keysToTransform = document.querySelectorAll('[data-key="'+ answer[i] + '"]');
            if (secondArray[i] === 'correct') {
                cellToTransform.classList.remove('cell', 'full');
                cellToTransform.classList.add('correct');

                keysToTransform.forEach(key => {
                    key.classList.remove('key');
                    key.classList.add('key-correct');
                });
            }
            if (secondArray[i] === 'present') {
                if (keysToTransform[0].classList.contains('key-correct')) {
                    cellToTransform.classList.remove('cell', 'full');
                    cellToTransform.classList.add('present');
                } else {
                    keysToTransform.forEach(key => {
                        key.classList.remove('key');
                        key.classList.add('key-present');
                    });
                    cellToTransform.classList.remove('cell', 'full');
                    cellToTransform.classList.add('present');
                }  
            }
            if (secondArray[i] === 'absent') {
                if (keysToTransform[0].classList.contains('key-correct') || keysToTransform[0].classList.contains('key-present')) {
                    cellToTransform.classList.remove('cell', 'full');
                    cellToTransform.classList.add('absent');
                } else {
                    keysToTransform.forEach(key => {
                        key.classList.remove('key');
                        key.classList.add('key-absent');
                    });
                    cellToTransform.classList.remove('cell', 'full');
                    cellToTransform.classList.add('absent');
                }
            }
        }, 150 * i);
    }
    setTimeout(function() {
        if(succes == secretWord.length) {
            gameOver = true;
            const alert = document.getElementById("alert");
            const p = document.createElement("p");
            p.classList.add('alert-end');
            let tryOrTries = "";
            if(answers.length == 1 ) {
                tryOrTries = "try"
            } else {
                tryOrTries = "tries";
            }
            p.innerText = "Congratulations! You found the word in " + answers.length + " " + tryOrTries +".";
            alert.appendChild(p); 
        } else {
            currentRow++;
            currentCell = 0;
            if (currentRow == nbOfTry && !gameOver) {
                gameOver = true;
                const alert = document.getElementById("alert");
                const p = document.createElement("p");
                p.classList.add('alert-end');
                p.innerText = "Too bad! The word was " + secretWord + ".";
                alert.appendChild(p); 
            }
        }
    }, 150 * secretWord.length); 
}

function deleteCell() {
    if (gameOver != true) {
        const cellToTest = document.getElementsByClassName(currentRow + '-' + currentCell)[0];
        if (currentCell != 0 && cellToTest.innerText == "") {
            currentCell--;
            const cellToDelete = document.getElementsByClassName(currentRow + '-' + currentCell)[0];
            cellToDelete.innerText = "";
            cellToDelete.classList.remove('full');
        }
        else {
            cellToTest.innerText = "";
            cellToTest.classList.remove('full');
        }
    }
}

function insertCell(letter) {
    if (currentCell < secretWord.length && gameOver != true) {
        const cellToTest = document.getElementsByClassName(currentRow + '-' + currentCell)[0];
        if (cellToTest.innerText == "") {
            cellToTest.innerText = letter;
            cellToTest.classList.add('full');
        }
        if ( currentCell != secretWord.length-1) {
            currentCell++;
        }
    }
}

function createKeyArray(word) {
    for (let i = 0; i < word.length; i++) {
        if (wordKeyArray.hasOwnProperty(word[i])) {
            wordKeyArray[word[i]]++;
        } else {
            wordKeyArray[word[i]] = 1;
        }
    }
}

function createEmptyKeyArray(word) {
    for (let i = 0; i < word.length; i++) {
        wordEmptyKeyArray[i] = "";
    }
}

function createAnswer() {
    for (let i = 0; i < secretWord.length; i++) {
        const letterFromCell = document.getElementsByClassName(currentRow + '-' + i)[0].innerText;
        answer += letterFromCell;
    }
}

function validate() {
    if(!enterKeyPressed && gameOver != true) {
        enterKeyPressed = true;
        const cellToTest = document.getElementsByClassName(currentRow + '-' + currentCell)[0];
        if (currentCell == secretWord.length-1 && cellToTest.innerText != "" && gameOver != true) {
            createAnswer();
            checkIfWordExist(answer)
            .then(exists => {
                if (exists) {
                    answers.push(answer);
                    update(secretWord, answer);
                    answer = "";
                    setTimeout(function() {
                        enterKeyPressed = false;
                    }, 600);
                } else {
                    answer = "";
                    const alert = document.getElementById("alert");
                    const p = document.createElement("p");
                    const rowToShake = document.getElementsByClassName(currentRow)[0];
                    rowToShake.classList.add('shake-row');
                    p.classList.add('alert-word');
                    p.innerText = "Word is not in the list.";
                    alert.appendChild(p);
                    setTimeout(function() {
                        alert.removeChild(p);
                        rowToShake.classList.remove('shake-row');
                        enterKeyPressed = false;
                    }, 600);
                }
            })
            .catch(error => {
                answer = "";
                const alert = document.getElementById("alert");
                const p = document.createElement("p");
                const rowToShake = document.getElementsByClassName(currentRow)[0];
                rowToShake.classList.add('shake-row');
                p.classList.add('alert-word');
                p.innerText = "Word is not in the list.";
                alert.appendChild(p);
                setTimeout(function() {
                    alert.removeChild(p);
                    rowToShake.classList.remove('shake-row');
                    enterKeyPressed = false;
                }, 600);
                console.error('Erreur lors de la vérification du mot:', error);
            });
        } else {
            const alert = document.getElementById("alert");     
            const p = document.createElement("p");
            p.classList.add('alert-word');
            p.innerText = "Word is too short.";
            const rowToShake = document.getElementsByClassName(currentRow)[0];
            rowToShake.classList.add('shake-row');
            alert.appendChild(p); 
            setTimeout(function() {
                alert.removeChild(p);
                enterKeyPressed = false;
                rowToShake.classList.remove('shake-row');
            }, 600);
        }
        return;
    }
}

function openDialog(dialogName) {
    const dialog = document.getElementById(dialogName);
    dialog.showModal();
}

function closeDialog(dialogName) {
    const dialog = document.getElementById(dialogName);
    dialog.close();
}

function keyboardAzerty() {
    const azertyButton = document.getElementById('button-azerty');
    if(azertyButton.classList.contains('unselected')) {
        const azerty = document.getElementById('keyboard-azerty');
        const qwerty = document.getElementById('keyboard-qwerty');
        const qwertyButton = document.getElementById('button-qwerty');
        qwerty.classList.add("hide");
        azerty.classList.remove("hide");
        azertyButton.classList.remove("unselected");
        azertyButton.classList.add('selected');
        qwertyButton.classList.remove("selected");
        qwertyButton.classList.add("unselected");
    }
}

function keyboardQwerty() {
    const qwertyButton = document.getElementById('button-qwerty');
    if (qwertyButton.classList.contains('unselected')) {
        const azerty = document.getElementById('keyboard-azerty');
        const qwerty = document.getElementById('keyboard-qwerty');
        const azertyButton = document.getElementById('button-azerty');
        qwerty.classList.remove("hide");
        azerty.classList.add("hide");
        azertyButton.classList.remove("selected");
        azertyButton.classList.add('unselected');
        qwertyButton.classList.remove("unselected");
        qwertyButton.classList.add("selected");
    }
}
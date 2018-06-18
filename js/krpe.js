/**
 * Returns an array with values within the specified range.
 * @param {number} start The lower bound, inclusive.
 * @param {number} stop The upper bound, exclusive.
 * @param {number} step The delta between values.
 */
function range (start, stop, step = 1) {
  if (!(step > 0 || step < 0)) throw new Error('step must be non-zero.');
  let result = [];
  for (let current = start;
    (step > 0) ? (current < stop) : (current > stop);
    current += step) {
    result.push(current);
  }
  return result;
}

/**
 * Splits an array into the specified number of arrays.
 * @param {any[]} arr The array to split.
 * @param {number} count The number of arrays to return.
 */
function divideArray (arr, count) {
  let results = range(0, count).map(() => []);
  arr.forEach((item, index) => results[index % count].push(item));
  return results;
}

/**
 * Returns an array with the elements offset by a specified amount.
 * @param {*} arr The array to rotate.
 * @param {*} offset The distance elements will be offset.
 */
function rotateArray (arr, offset) {
  if ((offset %= arr.length) < 0) offset += arr.length;
  if (offset === 0) return arr.slice();
  return arr.slice(-offset).concat(arr.slice(0, -offset));
}

/**
 * Returns an array with the elements in a random order.
 * @param {any[]} arr The array to shuffle.
 */
function shuffleArray (arr) {
  arr = arr.slice();
  let result = [];
  while (arr.length > 0) {
    let offset = Math.floor(Math.random() * arr.length);
    arr = rotateArray(arr, offset);
    result.push(arr.pop());
  }
  return result;
}

/**
 * Perform the "trick" with the heaps of characters.
 * @param {number[][]} charCodeHeaps
 * @param {number} middleIndex
 */
function processCharCodeHeaps (charCodeHeaps, middleIndex) {
  let elements = shuffleArray(charCodeHeaps
    .filter((_, index) => index !== middleIndex)
    .reduce((x, y) => x.concat(y), []));
  let splitPoint = elements.length >> 1;
  let before = elements.slice(0, splitPoint);
  let after = elements.slice(splitPoint);
  elements = before.concat(charCodeHeaps[middleIndex]).concat(after);
  let result = divideArray(elements, charCodeHeaps.length);
  return rotateArray(result, Math.floor(Math.random() * result.length));
}

/**
 * Convert a character into a suitable element to display.
 * @param {number} charCode
 */
function stylizeKey (charCode) {
  let className = 'key';
  let body = `&#${charCode};`;
  const rules = [
    { codes: [0], addClass: 'null' },
    { codes: [32], addClass: 'space', setBody: '(sp)' },
    { codes: range(48, 58), addClass: 'digit' },
    { codes: range(65, 91), addClass: 'upper' },
    { codes: range(97, 123), addClass: 'lower' }
  ];
  rules.filter(x => x.codes.includes(charCode)).forEach(rule => {
    if (rule.addClass) className += ' ' + rule.addClass;
    if (rule.setBody) body = rule.setBody;
  });
  return `<div class="${className}">${body}</div>`;
}

/**
 * Updates the user interface after each button press.
 * @param {HTMLButtonElement[]} buttons
 * @param {number[][]} charCodeHeaps
 * @param {number} requiredSteps
 * @param {number} step
 */
function update (buttons, charCodeHeaps, requiredSteps, step = 0) {
  if (buttons.length !== charCodeHeaps.length) throw new Error('Array lengths must match.');

  let remaining = requiredSteps - step;
  document.getElementById('remaining').textContent = remaining;
  document.getElementById('plural').textContent = (remaining === 1) ? '' : 'es';
  document.getElementById('instructions').className = (remaining === 1) ? 'finalPress' : '';

  buttons.forEach((button, index) => {
    let charCodes = charCodeHeaps[index];
    let breakAfter = [5, 12];
    button.innerHTML = charCodes
      .slice().sort((a, b) => a - b)
      .map((charCode, index) => stylizeKey(charCode) +
        (breakAfter.includes(index) ? '<br>' : '')).join('');
    button.onclick = () => {
      if (++step >= requiredSteps) {
        let char = String.fromCodePoint(charCodes[charCodes.length >> 1]);
        document.getElementById('password').value += char;
        console.log(document.getElementById('password').value);
        step = 0;
      }
      update(buttons, processCharCodeHeaps(charCodeHeaps, index), requiredSteps, step);
    };
  });
}

/**
 * Prepares the user interface.
 * @param {number[]} allowedCharCodes
 * @param {number} buttonCount
 */
function initialize (allowedCharCodes, buttonCount) {
  let charCount = allowedCharCodes.length;
  let nullsNeeded = (buttonCount - (charCount % buttonCount)) % buttonCount;
  if ((((charCount + nullsNeeded) / buttonCount) % 2) === 0) nullsNeeded += buttonCount;
  while (nullsNeeded-- > 0) allowedCharCodes.push(0);

  let buttonsSection = document.getElementById('buttons');
  let buttons = [];
  for (let index = 0; index < buttonCount; ++index) {
    let button = document.createElement('button');
    button.type = 'button';
    buttonsSection.appendChild(button);
    if (index === 2) buttonsSection.appendChild(document.createElement('br'));
    buttons.push(button);
  }

  let requiredSteps = Math.ceil(Math.log(allowedCharCodes.length) / Math.log(buttonCount));
  update(buttons, divideArray(shuffleArray(allowedCharCodes), buttonCount), requiredSteps);

  document.getElementById('reset').onclick = () => {
    document.getElementById('password').value = '';
    document.getElementById('results').className = 'hidden';
    update(buttons, divideArray(shuffleArray(allowedCharCodes), buttonCount), requiredSteps);
  };
  document.getElementById('submit').onclick = () => {
    document.getElementById('password-result').textContent = document.getElementById('password').value;
    document.getElementById('results').className = '';
    setTimeout(() => {
      document.getElementById('results').className = 'hidden';
    }, 2000);
  };
}

(function () {
  initialize(range(32, 127), 5);
})();

// declare/access elements needed
const clockDisplay = document.querySelector(".clock-display");
const optionButtons = document.querySelector("#option-buttons");
const startButton = document.querySelector("#startBtn");
let currentSelected = document.querySelector("[data-selected='true']");

// define enum (enumeration) or boolean flag for state management
const Timer = Object.freeze({
  isRunning: "isRunning",
  isPaused: "isPaused",
  isStopped: "isStopped",
});

// enum for active option
const OptionType = Object.freeze({
  isShortBreak: "short-break",
  isLongBreak: "long-break",
  isFocusOn: "focus-on"
});

// declare/define variables or create a global object
// variables as properties to save global name space
const GLOBAL = {
  duration: 0,
  totalDuration: 0,
  remainingDuration: 0,
  states: {
    currentTimerStatus: Timer.isStopped,
    currentOptionType: OptionType.isFocusOn
  },
  timerInterval: null,
  previousSelected: null,
  count: 0,
  maxCount: 3,
}

GLOBAL.duration = parseInt(currentSelected.dataset.value);

// initial display of duration
clockDisplay.innerHTML = formatTime(GLOBAL.duration)

// start/pause button handle
startButton.onclick = function () {
  switch (GLOBAL.states.currentTimerStatus) {
    case Timer.isStopped:
      startTime(GLOBAL.duration);
      break;
    case Timer.isPaused:
      // use updated remaining duration
      resumeTime(GLOBAL.remainingDuration);
      break;
    case Timer.isRunning:
      pauseTime();
      break
    default:
      stopTime();
      break;
  }
}

// main function for counting down
function countDown(duration, displayElement) {
  // define/declare variables
  // utilize closure
  let startTime = Date.now();
  let elapsedTime = startTime;
  let totalDuration = duration;
  let currentDuration = 0;
  GLOBAL.totalDuration = totalDuration

  return function () {
    GLOBAL.timerInterval = setInterval(() => {
      // define/declare variables that requires to be updated inside setInterval function
      let currentTime = Date.now();
      elapsedTime = Math.floor((currentTime - startTime) / 1000) // convert to seconds

      currentDuration = totalDuration - elapsedTime

      // keep updated to be used for resume function
      GLOBAL.remainingDuration = currentDuration;

      if (currentDuration <= 0) {
        stopTime();
        resetTime();

        // wait a certain time before running break
        setTimeout(() => {
          runOptionType()
        }, 3000);
      }

      displayElement.innerHTML = formatTime(currentDuration)
    }, 1000)
  }
}

// function for continuous running
function runOptionType() {
  // going to short/long break
  if (GLOBAL.states.currentOptionType === OptionType.isFocusOn) {
    GLOBAL.count += 1;
    if (GLOBAL.count >= GLOBAL.maxCount) {
      GLOBAL.count = 0;
      GLOBAL.states.currentOptionType = OptionType.isLongBreak;
      const longBreak = document.querySelector('[value="long-break"]')
      GLOBAL.duration = parseInt(longBreak.dataset.value)
      startTime(GLOBAL.duration)
    } else {
      GLOBAL.states.currentOptionType = OptionType.isShortBreak
      const shortBreak = document.querySelector('[value="short-break"]')
      GLOBAL.duration = parseInt(shortBreak.dataset.value)
      startTime(GLOBAL.duration)
    }
  } else { // return to focus
    GLOBAL.states.currentOptionType = OptionType.isFocusOn
    const focusOn = document.querySelector('[value="focus-on"]')
    GLOBAL.duration = parseInt(focusOn.dataset.value);
    startTime(GLOBAL.duration)
  }
  clockDisplay.innerHTML = formatTime(GLOBAL.duration)
}

// format time
function formatTime(duration) {
  // we can add modulo of 60 if total duration input exceeds 1 hour
  let minutes = Math.floor(duration / 60);
  minutes = String(minutes).padStart(2, '0')

  let seconds = duration % 60;
  seconds = String(seconds).padStart(2, '0')

  return `<span>${minutes}:${seconds}</span>`
}

// toggles/updates start button display text
function updateStartButton(state, buttonElement, isActive) {
  buttonElement.value = state;
  buttonElement.textContent = state.toUpperCase();
  buttonElement.dataset.active = isActive;
}

// countdown start
function startTime(duration) {
  if (GLOBAL.states.currentTimerStatus !== Timer.isRunning) {
    GLOBAL.states.currentTimerStatus = Timer.isRunning;
    const countdown = countDown(duration, clockDisplay)
    countdown();
    updateStartButton('pause', startButton, true)
  }
}

// stop time
function stopTime() {
  GLOBAL.states.currentTimerStatus = Timer.isStopped
  clearInterval(GLOBAL.timerInterval)
  updateStartButton("start", startButton, false)
}

// pause time
function pauseTime() {
  if (GLOBAL.states.currentTimerStatus === Timer.isRunning) {
    GLOBAL.states.currentTimerStatus = Timer.isPaused
    clearInterval(GLOBAL.timerInterval)
    updateStartButton("start", startButton, false)
  }
}

// resume time
function resumeTime(duration) {
  if (GLOBAL.states.currentTimerStatus !== Timer.isRunning) {
    startTime(duration)
  }
}

// reset time
function resetTime() {
  GLOBAL.duration = 0;
  GLOBAL.remainingDuration = 0;
  GLOBAL.timerInterval = null;
  clockDisplay.innerHTML = formatTime(0)
}


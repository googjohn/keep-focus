// import handleOptionButtons, { setFocusOn, setLongBreak, setShortBreak } from "./exportFunctions.js";
import { countDown, formatTime, updateStartButton } from "./utilityFn.js";
const clockDisplay = document.querySelector(".clock-display");
const optionBtns = document.querySelector("#option-buttons");
const startBtn = document.querySelector("#startBtn");
let currSelected = document.querySelector('[data-selected="true"]')

// define an enumeration - we can also use boolean flag
// states for when time is running, paused, or stopped
const States = Object.freeze({
  isRunning: "isRunning",
  isPaused: "isPaused",
  isStopped: "isStopped",
})

// enum for when focus-on, short break, or long break
const OptionStates = Object.freeze({
  isShortBreak: "short-break",
  isLongBreak: "long-break",
  isFocusOn: "focus-on"
})

let prevSelected = null;
let userInputDuration = null;
let inputValue = null;
let startTime = 0;
let elapsedTime = 0;
let duration = (inputValue || (parseInt(currSelected.dataset.value))); // base is minute, multiply by 60 for seconds value
let remainingDuration = 0;
let timerInterval = null;
let currentStatus = States.isStopped; // by default
let currentOptionStates = OptionStates.isFocusOn // by default
let count = 1;
let maxCount = 3; // count before long break and reset of count

// update the display with the current default values of time/duration
clockDisplay.innerHTML = formatTime(duration)

// ## functions for starting/pausing/resuming/stopping time
function startTimer() {
  if (currentStatus !== States.isRunning) {
    currentStatus = States.isRunning;
    // countdownTimer();
    const timer = countDown(duration, clockDisplay)

    timer();
    updateStartButton("pause", startBtn, true)
  }
}

function stopTimer() {
  if (currentStatus === States.isRunning || currentStatus === States.isPaused) {
    currentStatus = States.isStopped;
    clearInterval(timerInterval);
    resetTimer();
  }
}

function pauseTimer() {
  if (currentStatus === States.isRunning) {
    currentStatus = States.isPaused;
    clearInterval(timerInterval);
  }
}

function resumeTimer() {
  if (currentStatus === States.isPaused) {
    // use/update our duration with the remaining duration
    // this works due to lexical environment and functions in javascript searching
    // variables from call time and not creation time
    // so updating here is necessary because it will search first just outside its lexical scope
    // first before it go to the global scope if the variable is not found inside the function
    duration = remainingDuration;
    startTimer();
  }
}

function resetTimer() {
  if (currentStatus === States.isStopped) {
    startTime = 0;
    elapsedTime = 0;
    remainingDuration = 0;
    timerInterval = null;
    clockDisplay.innerHTML = formatTime(0)
  }
}

// ## attaching event to start/pause button
startBtn.onclick = () => {
  switch (currentStatus) {
    case States.isStopped:
      startTimer();
      // updateStartButton("pause", true);
      break;
    case States.isPaused:
      resumeTimer();
      // updateStartButton("pause", true);
      break;
    case States.isRunning:
      pauseTimer();
      // updateStartButton("start", false);
      break;
    default:
      stopTimer();
      break;
  }
}

// ## countdown function
function countdownTimer() {
  startTime = Date.now();
  elapsedTime = startTime;
  let currentDuration = 0;

  timerInterval = setInterval(() => {
    let currentTime = Date.now();

    // increasing per second
    elapsedTime = Math.floor((currentTime - startTime) / 1000)

    // total duration - increase per second = remainng duration
    currentDuration = duration - elapsedTime

    // if duration reaches 0, timer should stop
    if (currentDuration <= 0) {
      /* clearInterval(timerInterval);
      currentStatus = States.isStopped;
      clockDisplay.innerHTML = formatTime(0); */
      stopTimer();
      updateStartButton("start", startBtn, false)
    }

    // display the timer
    clockDisplay.innerHTML = formatTime(currentDuration)

    // update our remainingDuration for our resumeTimer to utilize
    remainingDuration = currentDuration

    // if count reaches max count we switch from focus on to long break instead of short break
    if (count >= maxCount) {
      if (remainingDuration <= 0 && currentOptionStates === OptionStates.isFocusOn) {
        currentOptionStates = OptionStates.isLongBreak;
        let currentElement = document.querySelector(`[value="${currentOptionStates}"]`)
        prevSelected = currSelected;
        currSelected = currentElement
        prevSelected.dataset.selected = false;
        currSelected.dataset.selected = true;
        currentDuration = currentElement.dataset.value
        remainingDuration = currentDuration;
        let currentValue = parseInt(currentElement.dataset.value)
        console.log('this is current value ', currentValue)
        setTimeout(() => {
          startTimer()
          updateStartButton("pause", startBtn, true)
        }, 3000)
        clockDisplay.innerHTML = formatTime(currentValue)
        updateBackground(currSelected)

        count = 0;

      }
    }

    // auto switches from focus on to shor break
    if (remainingDuration <= 0) {
      if (currentOptionStates === OptionStates.isFocusOn) {
        currentOptionStates = OptionStates.isShortBreak
        let currentElement = document.querySelector(`[value="${currentOptionStates}"]`)
        prevSelected = currSelected;
        currSelected = currentElement
        prevSelected.dataset.selected = false;
        currSelected.dataset.selected = true;
        currentDuration = currentElement.dataset.value
        remainingDuration = currentDuration
        let currentValue = parseInt(currentElement.dataset.value)
        console.log(currentElement)
        console.log('this is current value ', currentValue)

        console.log(remainingDuration)
        setTimeout(() => {
          console.log(remainingDuration)
          startTimer()
          updateStartButton("pause", true)
        }, 3000)
        clockDisplay.innerHTML = formatTime(currentValue)
        updateBackground(currSelected)


      } else if (currentOptionStates === OptionStates.isShortBreak || currentOptionStates === OptionStates.isLongBreak) {
        currentOptionStates = OptionStates.isFocusOn;
        let currentElement = document.querySelector(`[value="${currentOptionStates}"]`)
        prevSelected = currSelected;
        currSelected = currentElement
        prevSelected.dataset.selected = false;
        currSelected.dataset.selected = true;
        currentDuration = currentElement.dataset.value
        remainingDuration = currentDuration
        let currentValue = parseInt(currentElement.dataset.value)
        console.log(currentElement)
        console.log('this is current value ', currentValue)

        console.log(remainingDuration)
        setTimeout(() => {
          console.log(remainingDuration)
          startTimer()
          updateStartButton("pause", true)
        }, 3000)
        clockDisplay.innerHTML = formatTime(currentValue)
        updateBackground(currSelected)

        count += 1;

      }
    }
    // console.log(currentDuration)
    // console.log(remainingDuration)
  }, 1000)

  console.log(count)
  console.log(currentOptionStates)

}

function setOptionStates(optionState) {

}

/* function formatTime(duration) {

  let minute = Math.floor(duration / 60);
  minute = String(minute).padStart(2, '0');

  let second = duration % 60;
  second = String(second).padStart(2, '0');

  return `<span>${minute}:${second}</span>`
} */

/* function updateStartButton(state, active) {
  startBtn.value = state;
  startBtn.textContent = state.toUpperCase();
  startBtn.dataset.active = active;
} */

optionBtns.addEventListener('click', optionBtnHandler)

function updateSelected(element) {
  if (element.dataset.selected === 'false') {
    prevSelected = currSelected;
    currSelected = element;
    currSelected.dataset.selected = true;
    prevSelected.dataset.selected = false;
  }
}

// update background
function updateBackground(element) {
  let elementValue = element.value
  console.log(element)
  if (elementValue === 'focus-on') {
    document.body.style.backgroundColor = 'rgb(66, 45, 94)';
    // element.style.backgroundColor = 'rgb(66, 45, 94)';
    // element.classList.add('focus-on')
  } else if (elementValue === 'short-break') {
    document.body.style.backgroundColor = 'rgb(38, 152, 172)'
    // element.classList.add('short-break')
    // element.style.backgroundColor = 'rgb(38, 152, 172)'
  } else {
    document.body.style.backgroundColor = 'rgb(138, 45, 122)'
    // element.classList.add('long-break')
    // element.style.backgroundColor = 'rgb(138, 45, 122)'
  }
  // prevSelected.style.backgroundColor = "rgba(255, 255, 255, .3)"
}

function optionBtnHandler(event) {
  const message = document.querySelector('.message');
  let element = event.target
  let elementValue = element.value

  // default duration >> if user didn't specify/input any change in duration
  // then we use this default duration saved in data-value attribute
  let defaultDuration = (parseInt(element.dataset.value)) * 60

  if (element.dataset.selected === "false") {
    updateSelected(element)
  } else {
    return
  }

  switch (elementValue) {
    case 'focus-on':
      setFocusOn();
      updateBackground(element)
      break;
    case 'short-break':
      setShorBreak()
      updateBackground(element)
      break;
    case 'long-break':
      setLongBreak()
      updateBackground(element)
      break;
  }

  // create local functions to be used inside the handler
  // set time display, button, message for focus-on button
  function setFocusOn() {
    if (currentOptionStates !== OptionStates.isFocusOn) {
      currentOptionStates = OptionStates.isFocusOn
    }

    if (currentStatus === States.isRunning || currentStatus == States.isPaused) {
      stopTimer();
      updateStartButton('start', false)
    }
    duration = (inputValue * 60) || defaultDuration
    clockDisplay.innerHTML = formatTime(duration)
    message.textContent = `Time to focus!`
  }

  // set time display, button, message for short-break button
  function setShorBreak() {
    if (currentOptionStates !== OptionStates.isShortBreak) {
      currentOptionStates = OptionStates.isShortBreak
    }

    if (currentStatus === States.isRunning || currentStatus == States.isPaused) {
      stopTimer();
      updateStartButton('start', false)
    }
    duration = (inputValue * 60) || defaultDuration
    clockDisplay.innerHTML = formatTime(duration)
    message.textContent = `Take a ${elementValue.split('-')[0]} break.`
  }

  // set time display, button, message for long-break button
  function setLongBreak() {
    if (currentOptionStates !== OptionStates.isLongBreak) {
      currentOptionStates = OptionStates.isLongBreak
    }

    if (currentStatus === States.isRunning || currentStatus == States.isPaused) {
      stopTimer();
      updateStartButton('start', false)
    }
    duration = (inputValue * 60) || defaultDuration
    clockDisplay.innerHTML = formatTime(duration)
    message.textContent = `Take a ${elementValue.split('-')[0]} break.`
  }
}
// console.log(setFocusOn(currSelected, OptionStates))
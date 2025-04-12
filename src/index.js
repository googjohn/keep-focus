const clockDisplay = document.querySelector(".clock-display");
const optionBtns = document.querySelector("#option-buttons");
const startBtn = document.querySelector("#startBtn");
const defaultValueSelectedTimer = document.querySelector('[data-selected=true]');

// define an enumeration - we can also use boolean flag
const States = Object.freeze({
  isRunning: "isRunning",
  isPaused: "isPaused",
  isStopped: "isStopped",
})

let inputValue = 5;

let startTime = 0;
let elapsedTime = 0;
let duration = (parseInt(defaultValueSelectedTimer.dataset.value)) * 60; // base is minute, multiply by 60 for seconds value
let remainingDuration = 0;
let timerInterval = null;
let currentStatus = States.isStopped;

// update the display
clockDisplay.innerHTML = formatTime(duration)

function startTimer() {
  if (currentStatus !== States.isRunning) {
    currentStatus = States.isRunning;
    countdownTimer();
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
    clockDisplay.innerHTML = formatTime(duration)
  }
}

startBtn.onclick = () => {
  switch (currentStatus) {
    case States.isStopped:
      startTimer();
      updateButton("pause", true);
      break;
    case States.isPaused:
      resumeTimer();
      updateButton("pause", true);
      break;
    case States.isRunning:
      pauseTimer();
      updateButton("start", false);
      break;
    default:
      stopTimer();
      break;
  }

}

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
      clearInterval(timerInterval);
      currentStatus = States.isStopped;
      updateButton("start", false)
      clockDisplay.innerHTML = formatTime(0)
      return;
    }
    // display the timer
    clockDisplay.innerHTML = formatTime(currentDuration)

    // update our remainingDuration for our resumeTimer to utilize
    remainingDuration = currentDuration
  }, 1000)
}

function formatTime(duration) {

  let minute = Math.floor(duration / 60);
  minute = String(minute).padStart(2, '0');

  let second = duration % 60;
  second = String(second).padStart(2, '0');

  return `<span>${minute}:${second}</span>`
}

function updateButton(state, active) {
  startBtn.value = state;
  startBtn.textContent = state.toUpperCase();
  startBtn.dataset.active = active;
}

// delegate event to option-buttons container
let prevSelected = null;
let currSelected = document.querySelector('[data-selected=true]');
optionBtns.addEventListener("click", (event) => {
  let targetElem = event.target // current target/element

  if (targetElem.dataset.selected !== true) {
    prevSelected = currSelected;
    prevSelected.dataset.selected = false;
    targetElem.dataset.selected = true;
    currSelected = targetElem;
  }

  switch (event.target.value) {
    case "focus-on":
      setFocusOn();
      break;
    case "short-break":
      setShortBreak();
      break;
    case "long-break":
      setLongBreak();
      break;
    default:
      break;
  }
  function setFocusOn() {
    let defaultDuration = parseInt(getValue(targetElem))
    let typeDuration = (defaultDuration || duration) * 60
    clockDisplay.innerHTML = formatTime(typeDuration)

    duration = typeDuration
    if (currentStatus === States.isRunning) {
      stopTimer()
      updateButton("start", false)
    }
  }
  function setShortBreak() {
    let defaultDuration = parseInt(getValue(targetElem))
    let typeDuration = (defaultDuration || duration) * 60
    clockDisplay.innerHTML = formatTime(typeDuration)

    duration = typeDuration
    if (currentStatus === States.isRunning) {
      stopTimer()
      updateButton("start", false)
    }
  }
  function setLongBreak() {
    let defaultDuration = parseInt(getValue(targetElem))
    let typeDuration = (defaultDuration || duration) * 60
    clockDisplay.innerHTML = formatTime(typeDuration)

    duration = typeDuration
    if (currentStatus === States.isRunning) {
      stopTimer()
      updateButton("start", false)
    }
  }

  function getValue(elem) {
    return elem.dataset.value
  }
})








































function clickHandle(event) {

  const setFocusOn = () => {
    // prev = curr;
    let isSelected = event.target.dataset.selected
    if (!prev) {
      previousSelected = null;
    } else {

      previousSelected = document.querySelector(`[value=${prev}]`)
    }
    console.log(previousSelected)

    if (isSelected !== true) {
      isSelected = true;
      previousSelected.dataset.selected = false;
    }
    console.log(isSelected)
  };

  const setShortBreak = () => {
    // update the display
    clockDisplay.innerHTML = formatTime(duration)

  };

  const setLongBreak = () => {
    // update the display
    clockDisplay.innerHTML = formatTime(duration)
  };


  /*   switch (event.target.value) {
      case "focus-on":
        setFocusOn();
        break;
      case "short-break":
        setShortBreak();
        break;
      case "long-break":
        setLongBreak();
        break;
      default:
        break;
    } */
}
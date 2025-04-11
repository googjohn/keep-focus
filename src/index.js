const clockDisplay = document.querySelector(".clock-display");
const dataSelected = document.querySelector("[data-selected='true']");
const startBtn = document.querySelector("#startBtn");

// define an enumeration - we can also use boolean flag
const States = Object.freeze({
  isRunning: "isRunning",
  isPaused: "isPaused",
  isStopped: "isStopped",
})

let startTime = 0;
let elapsedTime = 0;
let duration = 25 * 60; // base is minute, multiply by 60 for seconds value
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
  console.log("status before click ", currentStatus)

  switch (currentStatus) {
    case States.isStopped:
      startTimer();
      updateButton("pause", true);
      console.log("status after click ", currentStatus)
      break;
    case States.isPaused:
      resumeTimer();
      updateButton("pause", true);
      console.log("status after click ", currentStatus)
      break;
    case States.isRunning:
      pauseTimer();
      updateButton("start", false);
      console.log("status after click ", currentStatus)
      break;
    default:
      stopTimer();
      console.log("status after click ", currentStatus)
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
      startBtn.textContent = "start".toUpperCase();
      startBtn.dataset.active = false;
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

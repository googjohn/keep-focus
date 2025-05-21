// declare/access elements needed
const clockDisplay = document.querySelector(".clock-display");
const optionButtons = document.querySelector("#option-buttons");
const startButton = document.querySelector("#startBtn");
let currentSelected = document.querySelector("[data-selected='true']");
const quoteElement = document.querySelector(".quote");
const messageElement = document.querySelector(".message");
const alarm = new Audio('./mixkit-digital-clock-digital-alarm-buzzer-992.wav');
const settings = document.querySelector("#modal-button");
const closeModal = document.querySelector(".close-modal");
const modal = document.querySelector('#modal-container');
const userInputs = document.querySelectorAll('.modal-input');
const saveButton = document.querySelector('.save');

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

// object for user input
const UserInput = {
  focusDuration: 0,
  shortBreakDuration: 0,
  longBreakDuration: 0,
  interval: 3, // default/min
}

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
  maxCount: UserInput.interval,
}

GLOBAL.duration = parseInt(currentSelected.dataset.value);

// initial display of duration
clockDisplay.innerHTML = formatTime(GLOBAL.duration);

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

// event listener to option buttons
optionButtons.addEventListener("click", optionTypeButtonHandle)

// main function for counting down
function countDown(duration, displayElement) {
  // define/declare variables
  // utilize closure
  let startTime = Date.now();
  let elapsedTime = startTime;
  let totalDuration = duration;
  let currentDuration = 0;
  GLOBAL.totalDuration = totalDuration;

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

        // send alert
        setTimeout(() => {
          // sendAlert(GLOBAL.states.currentOptionType)
        }, 1000)

        // wait a certain time before running break
        setTimeout(() => {
          runOptionType();
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

      // update background before changing current option type >> order matters
      const longBreak = document.querySelector('[value="long-break"]')
      updateButtonBackground(GLOBAL.states.currentOptionType, longBreak)

      GLOBAL.states.currentOptionType = OptionType.isLongBreak;
      updateAppBackground(GLOBAL.states.currentOptionType);

      GLOBAL.duration = parseInt(longBreak.dataset.value)
      startTime(GLOBAL.duration)

    } else {
      // update background before changing current option type >> order matters
      const shortBreak = document.querySelector('[value="short-break"]')
      updateButtonBackground(GLOBAL.states.currentOptionType, shortBreak)

      GLOBAL.states.currentOptionType = OptionType.isShortBreak
      updateAppBackground(GLOBAL.states.currentOptionType);

      GLOBAL.duration = parseInt(shortBreak.dataset.value)
      startTime(GLOBAL.duration)

    }
  } else { // return to focus

    // update background before changing current option type >> order matters
    const focusOn = document.querySelector('[value="focus-on"]')
    updateButtonBackground(GLOBAL.states.currentOptionType, focusOn)

    GLOBAL.states.currentOptionType = OptionType.isFocusOn
    updateAppBackground(GLOBAL.states.currentOptionType);

    GLOBAL.duration = parseInt(focusOn.dataset.value);
    startTime(GLOBAL.duration)

  }
  // update displays
  messageElement.textContent = updateMessage(GLOBAL.states.currentOptionType)
  clockDisplay.innerHTML = formatTime(GLOBAL.duration)
}

// format time
function formatTime(duration) {
  // we can add modulo of 60 if total duration input exceeds 1 hour
  let minutes = Math.floor(duration / 60);
  minutes = String(minutes < 0 ? 0 : minutes).padStart(2, '0')

  let seconds = duration % 60;
  seconds = String(seconds < 0 ? 0 : seconds).padStart(2, '0')

  return `<span>${minutes}:${seconds}</span>`
}

// toggles/updates start button display text
function updateStartButton(state, buttonElement, isActive) {
  buttonElement.value = state;
  buttonElement.textContent = state.toUpperCase();
  buttonElement.dataset.active = isActive;
}

// toggles/updates button and app background
function updateButtonBackground(optionType, element) {
  GLOBAL.previousSelected = document.querySelector(`[value='${optionType}']`)
  currentSelected = element;
  currentSelected.dataset.selected = true;
  GLOBAL.previousSelected.dataset.selected = false;
}

// toggles/updates app background >> use after global current option type has been modified
// to match the current timer type (focus, short-break, long-break)
function updateAppBackground(optionType) {
  /* if (!document.body.classList.length) {
    document.body.classList.add(optionType)
    } else {
      document.body.classList.forEach(item => document.body.classList.remove(item));
    document.body.classList.add(optionType)
    } */
  // let's simplify this by using className instead
  document.body.className = optionType
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

// send alert
function sendAlert(optionType) {
  if (optionType !== OptionType.isFocusOn) {
    alarm.play();
    alert("Time to focus!");
    alarm.pause()
    alarm.currentTime = 0;
  } else {
    alarm.play();
    alert("Take a break!")
    alarm.pause();
    alarm.currentTime = 0;
  }
}

// option types button handle
function optionTypeButtonHandle(event) {
  let currentSelected = document.querySelector("[data-selected='true']")
  const element = event.target;

  if (currentSelected.value === element.value) {
    return;
  } else {
    if (GLOBAL.states.currentTimerStatus !== Timer.isStopped) {
      stopTime();
    }

    GLOBAL.previousSelected = currentSelected;
    currentSelected = element;
    GLOBAL.previousSelected.dataset.selected = false;
    currentSelected.dataset.selected = true;

    // updated GLOBAL current option type to match the clicked button
    GLOBAL.states.currentOptionType = currentSelected.value

    updateAppBackground(currentSelected.value)

    GLOBAL.duration = parseInt(currentSelected.dataset.value)
    clockDisplay.innerHTML = formatTime(GLOBAL.duration)
  }
  messageElement.textContent = updateMessage(GLOBAL.states.currentOptionType)
}

// update message content
function updateMessage(optionType) {
  if (optionType !== OptionType.isFocusOn) {
    return `Time to take a ${optionType.split('-')[0]} break.`
  } else {
    return `Time to ${optionType.split('-')[0]}!`
  }
}

// next to add is user input of timings and/maybe add some motivation/inspirational quotes
settings.addEventListener('click', settingHandle)
closeModal.addEventListener('click', settingHandle)

// user input setttings
function settingHandle(event) {
  const button = event.target
  modal.classList.toggle('active')

  if (button.dataset.modalActive === 'true') {
    // button.dataset.modalActive = false;
    modal.dataset.modalActive = false;
  } else {
    // button.dataset.modalActive = true;
    modal.dataset.modalActive = true;
  }

  if (!modal.classList.contains('active')) {
    modal.dataset.modalActive = false;
    // button.dataset.modalActive = false
  }
}

// user input handle
function userInputHandle(event) {
  let element = event.target
  const inputValue = element.value
  switch (element.name) {
    case 'focus':
      console.log(inputValue)
      UserInput.focus = inputValue
      // GLOBAL.duration = UserInput.focus * 60
      /*  if (GLOBAL.states.currentOptionType === OptionType.isFocusOn) {
         clockDisplay.innerHTML = formatTime(UserInput.focus)
       } */
      break;
    case 'short-break':
      console.log(inputValue)
      UserInput.shortBreak = inputValue
      // GLOBAL.duration = UserInput.shortBreak * 60
      /*  if (GLOBAL.states.currentOptionType === OptionType.isShortBreak) {
         clockDisplay.innerHTML = formatTime(UserInput.shortBreak)
       } */
      break;
    case 'long-break':
      console.log(inputValue)
      UserInput.longBreak = inputValue
      // GLOBAL.duration = UserInput.longBreak * 60
      /* if (GLOBAL.states.currentOptionType === OptionType.isLongBreak) {
        clockDisplay.innerHTML = formatTime(UserInput.longBreak)
      } */
      break;
    case 'interval':
      console.log(inputValue)
      UserInput.interval = inputValue
      break;
    default:
      break;
  }
  // GLOBAL.duration = parseInt(inputValue);
  clockDisplay.innerHTML = formatTime(UserInput.focus)
}

// event listener to all inputs
userInputs.forEach(input => {
  input.addEventListener("change", userInputHandle)
})

saveButton.addEventListener('click', saveButtonHandle)

function saveButtonHandle() {
  modal.classList.toggle('active')
  modal.dataset.modalActive = false;
}

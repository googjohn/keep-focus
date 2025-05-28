import { Quotes } from "./quotes.js";

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
const saveButton = document.querySelector('.save');
const userInputs = document.querySelectorAll('.modal-input');
const inputFocus = document.querySelector("input[name='focus-on']");
const inputShortBreak = document.querySelector("input[name='short-break']");
const inputLongBreak = document.querySelector("input[name='long-break']");
const inputInterval = document.querySelector("input[name='interval']");
const timerBar = document.querySelector('#timer-indicator-bar');

// document.addEventListener('DOMContentLoaded', fetchQuotes)

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

// object for user input with default values from dataset
const UserInput = {
  focusDuration: parseInt(inputFocus.dataset.value),
  shortBreakDuration: parseInt(inputShortBreak.dataset.value),
  longBreakDuration: parseInt(inputLongBreak.dataset.value),
  interval: parseInt(inputInterval.dataset.value),
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
  currentSelected: currentSelected,
  previousSelected: null,
  count: 0,
  maxCount: UserInput.interval,
}

// check if there are saved settings in localStorage for user settings
// retrieve and use 
document.addEventListener('DOMContentLoaded', () => {
  try {
    const savedSettings = localStorage.getItem('userInputSettings');
    if (!savedSettings) {
      console.log('User setting doesn\'t exist.')
      return;
    }

    const parcedSettings = JSON.parse(savedSettings);

    // update UserInput with loaded values
    UserInput.focusDuration = parcedSettings.focusDuration || UserInput.focusDuration;
    UserInput.shortBreakDuration = parcedSettings.shortBreakDuration || UserInput.shortBreakDuration;
    UserInput.longBreakDuration = parcedSettings.longBreakDuration || UserInput.longBreakDuration;
    UserInput.interval = parcedSettings.interval || UserInput.interval;

    // update inputs to reflect input value
    inputFocus.value = UserInput.focusDuration;
    inputShortBreak.value = UserInput.shortBreakDuration;
    inputLongBreak.value = UserInput.longBreakDuration;
    inputInterval.value = UserInput.interval;

    // update global max count
    GLOBAL.maxCount = UserInput.interval;

    // update initial duration for potentially new/different duration from default value
    if (GLOBAL.states.currentOptionType === OptionType.isFocusOn) {
      GLOBAL.duration = UserInput.focusDuration * 60;
    }

    clockDisplay.innerHTML = formatTime(GLOBAL.duration);

    console.log('User settings successfully placed!', UserInput)
  } catch (error) {
    console.error('Error retrieving user settings', error)
    localStorage.clear();
  }
})

if (GLOBAL.states.currentOptionType === OptionType.isFocusOn) {
  GLOBAL.duration = UserInput.focusDuration * 60
}

// initial display of duration
clockDisplay.innerHTML = formatTime(GLOBAL.duration);

// start/pause button handle
startButton.onclick = function () {
  switch (GLOBAL.states.currentTimerStatus) {
    case Timer.isStopped:
      startTime(GLOBAL.duration);
      if (Notification.permission !== 'granted') {
        requestNotificationPermission()
      }
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

  return function () {

    GLOBAL.timerInterval = setInterval(() => {
      // define/declare variables that requires to be updated inside setInterval function
      let currentTime = Date.now();
      elapsedTime = Math.floor((currentTime - startTime) / 1000) // convert to seconds

      currentDuration = totalDuration - elapsedTime

      // keep updated to be used for resume function
      GLOBAL.remainingDuration = currentDuration;

      // timer bar indicator
      // will a border indicator instead
      /* let timerBarlength = GLOBAL.totalDuration - GLOBAL.remainingDuration
      timerBar.style.width = `${((timerBarlength / GLOBAL.totalDuration) * 100)}%`
      if (((timerBarlength / GLOBAL.totalDuration) * 100) === 100) {
        timerBar.style.backgroundColor = 'white'
      } else {
        timerBar.style.backgroundColor = 'rgba(175, 173, 173, 0.979)'
      } */

      updateProgressRect(duration, elapsedTime)

      if (currentDuration <= 0) {
        stopTime();
        resetTime();

        // custom notification using web notification api
        let notificationTitle = '';
        let notificationBody = '';

        if (GLOBAL.states.currentOptionType === OptionType.isFocusOn) {
          notificationTitle = 'Time for a break.';
          notificationBody = (GLOBAL.count >= (GLOBAL.maxCount - 1) ? "It's time for a long break." : 'Take a short break.');
        } else {
          notificationTitle = 'Back to focus.';
          notificationBody = "Break is over, it's time to get back to work.";
        }

        showNotification(notificationTitle, notificationBody, {
          tag: 'pomodoro-timer-end',
        })

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
      const longBreak = document.querySelector('button[value="long-break"]')
      updateButtonBackground(GLOBAL.states.currentOptionType, longBreak)

      GLOBAL.states.currentOptionType = OptionType.isLongBreak;
      updateAppBackground(GLOBAL.states.currentOptionType);

      GLOBAL.duration = UserInput.longBreakDuration * 60;
      startTime(GLOBAL.duration)

    } else {
      // update background before changing current option type >> order matters
      const shortBreak = document.querySelector('button[value="short-break"]')
      updateButtonBackground(GLOBAL.states.currentOptionType, shortBreak)

      GLOBAL.states.currentOptionType = OptionType.isShortBreak
      updateAppBackground(GLOBAL.states.currentOptionType);

      GLOBAL.duration = UserInput.shortBreakDuration * 60;
      startTime(GLOBAL.duration)

    }
  } else { // return to focus

    // update background before changing current option type >> order matters
    const focusOn = document.querySelector('button[value="focus-on"]')
    updateButtonBackground(GLOBAL.states.currentOptionType, focusOn)

    GLOBAL.states.currentOptionType = OptionType.isFocusOn
    updateAppBackground(GLOBAL.states.currentOptionType);

    GLOBAL.duration = UserInput.focusDuration * 60;
    startTime(GLOBAL.duration)

    randomIndex = Math.floor(Math.random() * (quotes.length + 1))
    quoteElement.innerHTML = quotes[randomIndex]

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
  GLOBAL.currentSelected = currentSelected;
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
  // set global total duration for the first time
  if (!GLOBAL.totalDuration) {
    GLOBAL.totalDuration = duration;
  }

  if (GLOBAL.states.currentTimerStatus !== Timer.isRunning) {
    GLOBAL.states.currentTimerStatus = Timer.isRunning;
    let countdown = countDown(duration, clockDisplay);
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
  GLOBAL.totalDuration = 0;
  GLOBAL.timerInterval = null;
  clockDisplay.innerHTML = formatTime(0)
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
      resetTime();
      let elapsedTime = GLOBAL.totalDuration - GLOBAL.remainingDuration;
      updateProgressRect(GLOBAL.totalDuration, elapsedTime)
    }

    GLOBAL.previousSelected = currentSelected;
    currentSelected = element;
    GLOBAL.previousSelected.dataset.selected = false;
    currentSelected.dataset.selected = true;
    GLOBAL.currentSelected = currentSelected;

    // update GLOBAL current option type to match the clicked button
    GLOBAL.states.currentOptionType = currentSelected.value

    updateAppBackground(currentSelected.value)
    // input counterpart of the focused button
    let inputName = document.querySelector(`input[name="${currentSelected.value}"]`).name.split('-')[0];
    let inputValue = parseInt(document.querySelector(`input[name="${currentSelected.value}"]`).value);
    let defaultValue = UserInput[inputName !== 'focus' ? `${inputName}BreakDuration` : `${inputName}Duration`]

    GLOBAL.duration = (inputValue || defaultValue) * 60;
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

// event listener to all inputs
userInputs.forEach(input => {
  input.addEventListener("change", userInputHandle)
})

// user input setttings
function settingHandle(event) {
  const button = event.target
  modal.classList.toggle('active')

  if (button.dataset.modalActive === 'true') {
    modal.dataset.modalActive = false;
  } else {
    modal.dataset.modalActive = true;
  }

  if (!modal.classList.contains('active')) {
    modal.dataset.modalActive = false;
  }
}

// user input handle
function userInputHandle(event) {
  let element = event.target
  let inputValue = parseInt(element.value)

  switch (element.name) {
    case OptionType.isFocusOn:
      UserInput.focusDuration = (inputValue || parseInt(element.dataset.value))
      break;
    case OptionType.isShortBreak:
      UserInput.shortBreakDuration = (inputValue || parseInt(element.dataset.value))
      break;
    case OptionType.isLongBreak:
      UserInput.longBreakDuration = (inputValue || parseInt(element.dataset.value))
      break;
    case 'interval':
      UserInput.interval = inputValue || parseInt(element.dataset.value)
      GLOBAL.maxCount = UserInput.interval;
      break;
    default:
      break;
  }

  if (element.name === GLOBAL.states.currentOptionType) {
    if (GLOBAL.states.currentTimerStatus !== Timer.isStopped) {
      stopTime();
      resetTime();
      let elapsedTime = GLOBAL.totalDuration - GLOBAL.remainingDuration;
      updateProgressRect(GLOBAL.totalDuration, elapsedTime)
    }

    GLOBAL.duration = (element.name === "focus-on" ? UserInput.focusDuration :
      element.name === 'short-break' ? UserInput.shortBreakDuration :
        UserInput.longBreakDuration) * 60;
    clockDisplay.innerHTML = formatTime(GLOBAL.duration)
  }
}

saveButton.addEventListener('click', saveButtonHandle)

// current function is just another wayt to close the modal
function saveButtonHandle() {
  modal.classList.toggle('active')
  modal.dataset.modalActive = false;

  try {
    const USER_INPUTS = JSON.stringify(UserInput)
    const userSettings = localStorage.setItem('userInputSettings', USER_INPUTS)
    if (!userSettings) {
      console.log('User input settings successfully saved to localstorage!')
    }
  } catch (error) {
    console.error('Error saving setting to localStorage!', error)
    if (typeof error === "QoutaExceededError") {
      localStorage.clear();
    }
  }
}

// request/send notification using web notification api
async function requestNotificationPermission() {
  // check if browser supports notification
  if (!('Notification' in window)) {
    console.log("Browser does not support notification!")
    return;
  }

  // check if notification has already been grandted or denied
  if (Notification.permission === 'granted') {
    console.log("Notification permission already granted.")
    return;
  } else if (Notification.permission === 'denied') {
    console.warn("Notification permission already denied. User will need to enable it manually")
    return;
  }

  // request for permission
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      console.log('You can now send notifications!')
    } else {
      console.log('Notification permission denied!')
    }
  } catch (error) {
    console.error('Error requesting notification permission.', error)
  }
}

function showNotification(title, body, options) {
  if (Notification.permission === "granted") {
    const notificationOptions = {
      body: body,
      tag: options.tag,
      renotify: options.renotify || true,
    }

    const notification = new Notification(title, notificationOptions)
    alarm.play();

    setTimeout(() => {
      if (!alarm.paused && notification) {
        notification.close();
      }
    }, 5000)

    notification.onclick = function () {
      window.focus();
      this.close();
    }

    notification.onclose = function () {
      alarm.pause();
      alarm.currentTime = 0;
    }

    notification.onerror = function () {
      console.error('Notification error.', error)
    }
  }
}

// fetch zen quotes
// because i am lazy to find free apis, i'll just fetch using postman to avoid rate limit
// fetch from https://zenquotes.io/api/quotes/ and save the quotes in an object/array
// and just cycle them or create a data.json using it and use as our own api
// this is wrong but i will have to be frugal and use the best way for me. 
// this is a personal project and will never be used for production that earns money
// thanks zenquotes.io!

/* async function fetchQuotes() {
  const options = {

  }
  try {
    const response = await fetch('https://zenquotes.io/api/quotes/', options);

    const quotes = await response.json();

    quotes.forEach(quote => {
      Quotes.push(quote)
    })
  } catch (error) {
    console.log('Error fetching quotes.', error)
  }
} */


// this would be the simplest way
// will try to utilize/convert to own api later so i can use data fetching in this project as well
const quotes = Quotes.map(quote => quote.h)

let randomIndex = Math.floor(Math.random() * (quotes.length + 1))
quoteElement.innerHTML = quotes[randomIndex]

// try container side indicator
function updateProgressRect(duration, elapsedTime) {
  let progress;
  const container = document.querySelector("#options-container");
  const rect = document.querySelector(".progress-rect");
  const svg = document.querySelector(".progress-svg");

  if (GLOBAL.states.currentTimerStatus !== Timer.isStopped) {
    svg.classList.add('show')
  } else {
    svg.classList.remove('show')
  }

  if (GLOBAL.totalDuration !== duration) {
    let elapsedTotal = (GLOBAL.totalDuration - duration) + elapsedTime
    progress = elapsedTotal / GLOBAL.totalDuration
  } else {
    progress = elapsedTime / duration;
  }


  rect.setAttribute('rx', 10);
  rect.setAttribute('ry', 10);

  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const perimeter = 2 * (width + height);

  rect.setAttribute("stroke-dasharray", perimeter);
  rect.setAttribute("stroke-dashoffset", perimeter * (1 - progress));

  if (progress === 1) {
    rect.classList.add('white')
  } else {
    rect.classList.remove('white')
  }
}

// during resize, perimeter or total size/length of container/element changes
window.addEventListener('resize', () => {
  updateProgressRect(GLOBAL.totalDuration, GLOBAL.totalDuration - GLOBAL.remainingDuration)
})

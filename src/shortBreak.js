import {
  startTimer,
  stopTimer,
  formatTime,
  pauseTimer,
  resetTimer,
  resumeTimer,
  updateButton,
  countdownTimer,
  States
} from "./index.js";

const shortBreakBtn = document.querySelector('[value=short-break]')
shortBreakBtn.onclick = startTimer
console.log(startTimer())
console.log(startTimer)

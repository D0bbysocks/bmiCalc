const formError = document.querySelector(".form-error");

const heightInput = document.querySelector("#height");
const weightInput = document.querySelector("#weight");
const metricUI = document.querySelector(".metricUI");
const imperialUI = document.querySelector(".ImperialUI");


const radio = document.querySelectorAll(".radio");

let metric = true;

let weight = null;
let height = null;
let bmi = null;

function bmiCalc() {
  if (weight !== null && height !== null) {
    bmi = weight * height; // placeholder, später richtige Formel
  }
}

function updateUnitUI() {
  if (metric) {
    metricUI.hidden = false;
    imperialUI.hidden = true;
  } else {
    imperialUI.hidden = false;
    metricUI.hidden = true;
  }
}

function metricCheck(event) {
  const btn = event.target;

  if (btn.value === "metric") {
    metric = true;
  } else if (btn.value === "imperial") {
    metric = false;
  }

  updateUnitUI();
}

radio.forEach(btn => {
  btn.addEventListener("change", metricCheck);
});

updateUnitUI();

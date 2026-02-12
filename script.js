// DOM
const metricsBtn = document.querySelectorAll(".metrics input");
const inputs = document.querySelectorAll(".input-with-unit input");

const metricUI = document.querySelector(".metricUI");
const imperialUI = document.querySelector(".ImperialUI");

const bmiWelcomeUI = document.querySelector(".score-welcome");
const bmiResultUI = document.querySelector(".score-result");

const bmiRangeLow = document.querySelector("#weight-rangeLow");
const bmiRangeHigh = document.querySelector("#weight-rangeHigh");

// STATE – single source of truth
const state = {
  isMetric: true,

  // Metric
  height: null,
  weight: null,

  // Imperial
  heightInches: null,
  weightLbs: null,

  // BMI Score
  bmi: null,
  bmiMin: null,
  bmiMax: null,

  bmiMinSt: null,
  bmiMinLbs: null,
  bmiMaxSt: null,
  bmiMaxLbs: null,


  // touched
  touched: {
    height: false,
    weight: false,
  },
};

// LOGIC / HELPERS
function resetState() {
  state.height = null;
  state.weight = null;
  state.bmi = null;

  state.touched = {
    height: false,
    weight: false,
  };
}

function clearInputsAndErrors() {
  // Inputs leeren
  inputs.forEach((input) => {
    input.value = "";
  });

  // Fehlertexte löschen + verstecken (falls vorhanden)
  document.querySelectorAll(".form-error").forEach((el) => {
    el.textContent = "";
    el.hidden = true;
  });
}

function resetAll() {
  resetState();
  clearInputsAndErrors();
  renderBMI()
}

function updateStateFromInput(input) {
  const value = input.value === "" ? null : Number(input.value);
  state[input.name] = value;
}

// Fehlertext bestimmen (Custom Messages)
const rangeMessages = {
  height: "Please enter a valid height. (1–250 cm)",
  weight: "Please enter a valid weight. (1–400 kg)",
};

function getErrorMessage(input) {
  const { validity: v, name } = input;

  if (v.valueMissing) return "This field is required.";
  if (v.typeMismatch || v.badInput) return "Please enter a number.";

  if ((v.rangeUnderflow || v.rangeOverflow) && rangeMessages[name]) {
    return rangeMessages[name];
  }

  return "Invalid value.";
}

function errorCheck(input) {
  const v = input.validity;

  // 1) Required nur anzeigen, wenn touched
  if (v.valueMissing) {
    const message = state.touched[input.name] ? getErrorMessage(input) : "";
    errorRender(input, message);
    return;
  }

  // 2) Alle anderen Fehler sofort (auch ohne touched)
  const message = v.valid ? "" : getErrorMessage(input);
  errorRender(input, message);
}

function isReady(height, weight) {
  return  height != null &&
          weight != null &&
          height > 0 &&
          weight > 0
}

function getMetricValues() {
  if (state.isMetric) {
    return { heightCm: state.height, weightKg: state.weight };
  }

  let inches = (state.height * 12) + state.heightInches;
  let heightCm = inches * 2.54;

  let pounds = (state.weight * 14) + state.weightLbs;
  let weightKg = pounds * 0.45359237;

  return {heightCm, weightKg};
}

function calculateBMI() {
  const { heightCm, weightKg } = getMetricValues();

  if (!isReady(heightCm, weightKg)) {
    state.bmi = null;
    return
  }

  let height = heightCm / 100;
  state.bmi = weightKg / (height * height);

  calculateBMIrange(height)
}

function calculateBMIrange(height) {
  state.bmiMin = 18.5 * (height * height);
  state.bmiMax = 24.9 * (height *height);
}

function BMIrangeImperial(weightInKg) {
  const totalLbs = weightInKg * 2.20462;

  let stone = Math.floor(totalLbs / 14);
  let lbs = Math.round(totalLbs - stone * 14);

  // Edge Case: wenn lbs durch Rundung 14 wird
  if (lbs === 14) {
    stone += 1;
    lbs = 0;
  }

  return { stone, lbs };
}


// RENDER
function renderBMIrange() {
  if (!state.isMetric) {
    const min = BMIrangeImperial(state.bmiMin);
    const max = BMIrangeImperial(state.bmiMax);

    bmiRangeLow.innerHTML = `${min.stone}st ${min.lbs}lbs`;
    bmiRangeHigh.innerHTML = `${max.stone}st ${max.lbs}lbs`;


  } else {
    bmiRangeLow.innerHTML = `${state.bmiMin.toFixed(0)}kgs`;
    bmiRangeHigh.innerHTML = `${state.bmiMax.toFixed(0)}kgs`;
  }
}


function renderMetricsUI() {
  metricUI.hidden = !state.isMetric;
  imperialUI.hidden = state.isMetric;
}

function errorRender(input, message) {
  const errorEl = input.closest(".form-group")?.querySelector(".form-error");
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.hidden = message === "";
}

function renderBMI() {
  const hasBMI = state.bmi !== null;

  bmiWelcomeUI.hidden = hasBMI;
  bmiResultUI.hidden = !hasBMI;

  if (hasBMI) {
    const showBmi = document.querySelector(".score");
    showBmi.innerHTML = state.bmi.toFixed(1);
    renderBMIrange();

  }
}

// EVENTS
metricsBtn.forEach((btn) => {
  btn.addEventListener("change", (e) => {
    state.isMetric = e.target.value === "metric";
    resetAll();
    renderMetricsUI();
  });
});

inputs.forEach((input) => {
  // Beim Tippen: State updaten, Fehler nur zeigen wenn bereits touched
  input.addEventListener("input", (e) => {
    updateStateFromInput(e.target);
    errorCheck(e.target);
    calculateBMI();
    renderBMI();
  });

  // Beim Verlassen: touched setzen, dann Fehler prüfen (required darf jetzt erscheinen)
  input.addEventListener("blur", (e) => {
    state.touched[e.target.name] = true;
    errorCheck(e.target);
  });

  // Browser-Default-Tooltip verhindern
  input.addEventListener("invalid", (e) => e.preventDefault());
});

// Initial
renderMetricsUI();

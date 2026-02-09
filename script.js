/* =========================
   DOM REFERENCES
========================= */

const metricUI = document.querySelector(".metricUI");
const imperialUI = document.querySelector(".ImperialUI");
const inputs = document.querySelectorAll(".input-with-unit input");
const radios = document.querySelectorAll(".radio");

let calcTimer;

/* =========================
   STATE
========================= */

const state = {
  isMetric: true,

  // metric
  heightCm: null,
  weightKg: null,

  // imperial
  heightFeet: null,
  heightInches: null,
  weightSt: null,
  weightLbs: null,

  // result
  bmi: null,
};

/* =========================
   VALIDATION MESSAGES
========================= */

const rangeMessages = {
  weightKg: "Please enter a valid weight. (1-400 kg)",
  heightCm: "Please enter a valid height. (30-250 cm)",
  // optional:
  // heightFeet: "...",
  // heightInches: "...",
  // weightSt: "...",
  // weightLbs: "...",
};

/* =========================
   UI: UNIT TOGGLE
========================= */

function updateUnitUI() {
  metricUI.hidden = !state.isMetric;
  imperialUI.hidden = state.isMetric;
}

/* =========================
   PURE HELPERS (NO UI)
========================= */

function convertImperialToMetric() {
  const feet = state.heightFeet ?? 0;
  const inches = state.heightInches ?? 0;
  const stone = state.weightSt ?? 0;
  const pounds = state.weightLbs ?? 0;

  // height
  const totalInches = feet * 12 + inches;
  const heightCm = totalInches * 2.54;

  // weight
  const totalLbs = stone * 14 + pounds;
  const weightKg = totalLbs * 0.45359237;

  return { heightCm, weightKg };
}

function getHealthyWeightRange(heightM) {
  const min = 18.5 * heightM ** 2;
  const max = 24.9 * heightM ** 2;

  return {
    min: min.toFixed(1),
    max: max.toFixed(1),
  };
}

function isReady() {
  if (state.isMetric) {
    return state.heightCm > 0 && state.weightKg > 0;
  }

  return (
    state.heightFeet != null &&
    state.heightInches != null &&
    state.weightSt != null &&
    state.weightLbs != null &&
    (state.weightSt > 0 || state.weightLbs > 0)
  );
}

/* =========================
   VALIDATION UI HELPERS
========================= */

function clearFieldError(input) {
  const errorEl = input.closest(".form-group")?.querySelector(".form-error");
  if (!errorEl) return;
  errorEl.textContent = "";
  errorEl.hidden = true;
}

function getErrorMessage(input) {
  const { validity: v, name } = input;

  if (v.valueMissing) return "This field is required.";
  if (v.typeMismatch || v.badInput) return "Please enter a number.";

  if ((v.rangeUnderflow || v.rangeOverflow) && rangeMessages[name]) {
    return rangeMessages[name];
  }

  return "Invalid value.";
}

function showOrHideError(input) {
  const errorEl = input.closest(".form-group")?.querySelector(".form-error");
  if (!errorEl) return;

  if (!input.checkValidity()) {
    errorEl.textContent = getErrorMessage(input);
    errorEl.hidden = false;
  } else {
    clearFieldError(input);
  }
}

/* =========================
   RENDER FUNCTIONS
========================= */

function renderBmiUI() {
  const welcome = document.querySelector(".score-welcome");
  const result = document.querySelector(".score-result");

  const hasBmi = state.bmi !== null;
  welcome.hidden = hasBmi;
  result.hidden = !hasBmi;
}

function renderBMI() {
  if (!isReady()) {
    // wenn nicht ready, Ergebnis zurücksetzen/ausblenden
    state.bmi = null;
    renderBmiUI();
    return;
  }

  let heightCm, weightKg;

  if (state.isMetric) {
    heightCm = state.heightCm;
    weightKg = state.weightKg;
  } else {
    ({ heightCm, weightKg } = convertImperialToMetric());
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  state.bmi = Number(bmi.toFixed(1));

  // Score anzeigen
  document.querySelector(".score").textContent = state.bmi;

  // Range anzeigen (wenn Element existiert)
  const rangeEl = document.querySelector(".weight-range");
  if (rangeEl) {
    const range = getHealthyWeightRange(heightM);
    rangeEl.textContent = `${range.min}kgs - ${range.max}kgs`;
  }

  renderBmiUI();
}

/* =========================
   INPUT → STATE
========================= */

function updateStateFromInput(input) {
  const { name, value } = input;
  const num = value.trim() === "" ? null : Number(value);

  if (num !== null && Number.isNaN(num)) return;

  if (state.isMetric) {
    if (name === "heightCm") state.heightCm = num;
    if (name === "weightKg") state.weightKg = num;
  } else {
    if (name === "heightFeet") state.heightFeet = num;
    if (name === "heightInches") state.heightInches = num;
    if (name === "weightSt") state.weightSt = num;
    if (name === "weightLbs") state.weightLbs = num;
  }
}

/* =========================
   SCHEDULING
========================= */

function scheduleRender() {
  clearTimeout(calcTimer);
  calcTimer = setTimeout(renderBMI, 500);
}

/* =========================
   EVENT HANDLERS
========================= */

function onInput(e) {
  const input = e.target;
  console.log(input);
  updateStateFromInput(input);
  showOrHideError(input);
  scheduleRender();
}

function metricCheck(e) {
  state.isMetric = e.target.value === "metric";
  resetInputs();
  updateUnitUI();
  scheduleRender();
}

/* =========================
   RESET (NO VALIDATION TRIGGER)
========================= */

function resetInputs() {
  // state reset
  state.heightCm = null;
  state.weightKg = null;
  state.heightFeet = null;
  state.heightInches = null;
  state.weightSt = null;
  state.weightLbs = null;
  state.bmi = null;

  // fields reset + errors clear (OHNE checkValidity)
  inputs.forEach((i) => {
    i.value = "";
    clearFieldError(i);
  });

  renderBmiUI();
}

/* =========================
   LISTENERS
========================= */

radios.forEach((btn) => btn.addEventListener("change", metricCheck));

inputs.forEach((input) => {
  input.addEventListener("input", onInput);
  input.addEventListener("invalid", (e) => e.preventDefault());
});

/* =========================
   INIT
========================= */

updateUnitUI();
renderBmiUI();

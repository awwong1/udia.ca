/** Utility for controlling page appearance (dark/light mode).
 * Inspired by https://www.gwern.net/static/js/darkmode.js
 */

if (typeof (window.UDIA) == "undefined") {
  window.UDIA = {};
}

/***********/
/* HELPERS */
/***********/

/**
 * Adds an event listener to a button (or other clickable element), attaching
 * it to both "click" and "keyup" events (for use with keyboard navigation).
 * Optionally also attaches the listener to the 'mousedown' event, making the
 * element activate on mouse down instead of mouse up.
 * @param {*} func 
 * @param {*} includeMouseDown 
 */
function addActivateEvent(fn, includeMouseDown) {
  let ael = (event) => {
    if (event.button === 0 || event.key === ' ') fn(event);
  }
  this.activateEventListener = ael;
  if (includeMouseDown) this.addEventListener("mousedown", ael);
  this.addEventListener("click", ael);
  this.addEventListener("keyup", ael);
}
Element.prototype.addActivateEvent = addActivateEvent;

/**
 * Adds a scroll event listener to the page.
 * @param {*} fn 
 * @param {string?} name 
 */
function addScrollListener(fn, name) {
  let wrapper = (event) => {
    requestAnimationFrame(() => {
      fn(event);
      document.addEventListener("scroll", wrapper, { once: true, passive: true });
    });
  }
  document.addEventListener("scroll", wrapper, { once: true, passive: true });

  // Retain a reference to the scroll listener, if a name is provided.
  if (typeof name == "string") window.UDIA[name] = wrapper;
}

/******************/
/* MODE SELECTION */
/******************/

function injectModeSelector() {
  // retrieve the local theme mode setting
  let currentMode = localStorage.getItem("selected-mode") || "auto";

  let themeSelector = document.getElementById("theme-selector");
  themeSelector.style.setProperty("visibility", "visible");

  // by default, this is the 'auto' css styles
  window.UDIA.themeSelector = themeSelector;

  themeSelector.querySelectorAll("button").forEach((button) => {
    button.addActivateEvent((event) => {
      // Determine which setting was chosen (i.e., which button was clicked).
      let selectedMode = event.target.dataset.name;

      // Save the new setting.
      if (selectedMode == "auto") {
        localStorage.removeItem("selected-mode");
      } else {
        localStorage.setItem("selected-mode", selectedMode);
      }

      // Actually change the mode.
      setMode(selectedMode);
    });
  });

  setMode(currentMode);

  // We pre-query the relevant elements, so we do not have to run queryAll on
  // every firing of the scroll listener.
  window.UDIA.scrollState = {
    "lastScrollTop": window.pageYOffset || document.documentElement.scrollTop,
    "unbrokenDownScrollDistance": 0,
    "unbrokenUpScrollDistance": 0,
  };
  addScrollListener(updateModeSelectorVisibility, "updateModeSelectorVisibilityScrollListener");
  window.UDIA.themeSelector.addEventListener("mouseover", showModeSelector);
}

/**
 * Show/hide the mode selector in response to scrolling.
 * @param {*} _
 */
function updateModeSelectorVisibility(_) {
  let newScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  window.UDIA.scrollState.unbrokenDownScrollDistance = (newScrollTop > window.UDIA.scrollState.lastScrollTop) ?
    (window.UDIA.scrollState.unbrokenDownScrollDistance + newScrollTop - window.UDIA.scrollState.lastScrollTop) :
    0;
  window.UDIA.scrollState.unbrokenUpScrollDistance = (newScrollTop < window.UDIA.scrollState.lastScrollTop) ?
    (window.UDIA.scrollState.unbrokenUpScrollDistance + window.UDIA.scrollState.lastScrollTop - newScrollTop) :
    0;
  window.UDIA.scrollState.lastScrollTop = newScrollTop;

  // Hide mode selector when scrolling a half-page down.
  if (window.UDIA.scrollState.unbrokenDownScrollDistance > (window.innerHeight / 2)) {
    hideModeSelector();
  }

  // Show mode selector on ANY scroll up.
  if (window.UDIA.scrollState.unbrokenUpScrollDistance > 0 || window.UDIA.scrollState.lastScrollTop <= 0) {
    showModeSelector();
  }
}

function hideModeSelector() {
  window.UDIA.themeSelector.style.setProperty("opacity", "0");
  window.UDIA.themeSelector.classList.add("hidden");
}

function showModeSelector() {
  window.UDIA.themeSelector.style.removeProperty("opacity");
  window.UDIA.themeSelector.classList.remove("hidden");
}

/**
 * Update the states of the mode selector buttons.
 */
function updateModeSelectorState() {
  // Get saved mode setting (or default).
  let currentMode = localStorage.getItem("selected-mode") || "auto";

  // Clear current buttons state.
  window.UDIA.themeSelector.querySelectorAll("button").forEach((button) => {
    button.classList.remove("active", "selected");
    button.disabled = false;
  });

  // Set the correct button to be selected.
  window.UDIA.themeSelector.querySelectorAll(`.select-mode-${currentMode}`).forEach((button) => {
    button.classList.add("selected", "active");
    button.disabled = true;
  });

  // Ensure the right button (light or dark) has the 'currently active'
  // indicator, if the current mode is 'auto'
  if (currentMode == "auto") {
    if (matchMedia("(prefers-color-scheme: dark)").matches) {
      window.UDIA.themeSelector.querySelector(".select-mode-dark").classList.add("active");
    } else {
      window.UDIA.themeSelector.querySelector(".select-mode-light").classList.add("active");
    }
  }
}

/*  Set specified color mode (auto, light, dark).
  */
function setMode(modeOption) {
  var body = document.body;
  // Inject the appropriate styles.
  if (modeOption === "auto") {
    body.classList.remove("dark-mode");
  }
  if (modeOption === 'dark' || matchMedia("(prefers-color-scheme: dark)").matches) {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }

  // Update selector state.
  updateModeSelectorState();
}

if (document.readyState === "complete") {
  injectModeSelector();
} else {
  window.addEventListener("load", injectModeSelector);
}

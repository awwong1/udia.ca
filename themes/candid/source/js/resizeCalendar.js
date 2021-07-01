function initializeCalendarResizer() {
  const gcal = document.getElementById("google-calendar");
  function resizeGoogleCalendar() {
    const main = document.getElementById("main");
    gcal.setAttribute("width", main.clientWidth);
  }
  if (gcal) {
    window.addEventListener("resize", resizeGoogleCalendar);
    resizeGoogleCalendar();
  }
}

if (document.readyState === "complete") {
  initializeCalendarResizer();
} else {
  window.addEventListener("load", initializeCalendarResizer);
}
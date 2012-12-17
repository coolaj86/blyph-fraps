function donada() {}

// get with the program firefox... really
if (!window.console) {
  window.console = {
      log: donada
    , error: donada
    , warn: donada
    , dir: donada
    , info: donada
    , debug: donada
  }
}

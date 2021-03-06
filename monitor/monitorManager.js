const Monitor = require("./monitor");
const NonexistentResourceError = require("./error/nonexistentResourceError");
const InvalidDataError = require("./error/invalidDataError");

const monitorManager = {
  monitors : {},
  add : function (service, url) {
    const monitor = new Monitor(service, url);
    this.monitors[service] = monitor;

    return monitor;
  },
  check : function (service) {
    this._verifyService(service);
    const monitor = this.monitors[service];
    return monitor.isServiceOn();
  },
  trigger : function (monitor, state) {
    this._verifyState(state);
    if(state){     
      this.monitors[monitor].activate();
    }
    else{
      this.monitors[monitor].deactivate();
    }
  },
  triggerAll : function (state) {
    for (let monitor in this.monitors){
      this.trigger(monitor, state);
    }
  },
  _verifyState : function (state) {
    if(!(state === true || state === false)){
      throw new InvalidDataError(['state']);
    }
  },
  _verifyService : function (service) {
    if (this.monitors[service] === undefined){
      throw new NonexistentResourceError("Servicio", service, "VerificarServicio");
    }
  }
};

const UNQFY_API_HOST = process.env["UNQFY_API_HOST"];
const NEWSLETTER_API_HOST = process.env["NEWSLETTER_API_HOST"];
const LOGGING_API_HOST = process.env["LOGGING_API_HOST"];

monitorManager.add("UNQfy", UNQFY_API_HOST);
monitorManager.add("Newsletter", NEWSLETTER_API_HOST);
monitorManager.add("Logging", LOGGING_API_HOST);

monitorManager.triggerAll(true);

module.exports = monitorManager;

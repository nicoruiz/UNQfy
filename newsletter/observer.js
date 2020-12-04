const GMailAPIClient = require("./clients/gmailClient/GMailAPIClient");

class Observer {
  constructor(email) {
    this.email = email;
    this.gmailClient = new GMailAPIClient();
  }

  sendEmail(subject, message) {
    this.gmailClient
      .send_mail(
        subject,
        [message],
        {
          name: this.email,
          email: this.email,
        },
        {
          name: "UNQfy newsletter",
          email: "unqfy@gmail.com",
        }
      )
      .then((gmailResponse) => {
        console.log("Mail enviado!");
        console.log(gmailResponse);
      })
      .catch((error) => {
        console.error("Algo salió mal");
        console.error(error);
      });
  }
}

module.exports = Observer;

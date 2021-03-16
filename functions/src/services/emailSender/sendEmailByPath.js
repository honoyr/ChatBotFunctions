import path from "path";
import fs from "fs";
import sendEmail from "./emailSender";

// import tmp from "../../../files/template.html";

const sendEmailByPath = (emailAttendee, fileUrl) => {
  const certPath = path.join(__dirname, fileUrl);
  // console.log("PATH" + certPath);
  fs.readFile(certPath, "utf8", (err, htmlTemplate) => {
    if (err) {
      console.log(err.stack);
      return;
    }
    // console.log("Email was sent to " + emailAttendee);
    sendEmail(emailAttendee, htmlTemplate.toString());
  });
  // console.log("Program Ended");
};

export {sendEmailByPath};

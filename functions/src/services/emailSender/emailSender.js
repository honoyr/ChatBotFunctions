import emailAPISender from "../../config";
import https from "https";

// eslint-disable-next-line valid-jsdoc
/**
 * Send email to recipient.
 * @{emailAttendee} Email address.
 * @{htmlTemplate} email template.
 *
 */

// eslint-disable-next-line require-jsdoc
export default function sendEmail(emailAttendee, htmlTemplate) {
  // const apikey = serviceAccount.postohubEmailApiKey;
  const data = JSON.stringify({
    "sender_id": emailAPISender.sender_id,
    "content": {
      "html": htmlTemplate,
    },
    "to": {
      "name": emailAttendee,
      "email": emailAttendee,
    },
    "reply_to": {
      "name": "Dennis Gonor",
      "email": "dennis.gonor@gmail.com",
    },
    "subject": "Dennis Gonor SE Resume",
    "preview_message": "Resume",
    "mail_settings": {
      "expand_preview": true,
      "add_unsubscribe": true,
    },
  });

  const options = {
    hostname: "prod-api-integration.postohub.io",
    port: 443,
    path: "/integration/mail/send",
    method: "POST",
    headers: {
      "accept": "application/json",
      "X-API-KEY": emailAPISender.apikey,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 */

"use strict";

const functions = require("firebase-functions");
const {google} = require("googleapis");
const {WebhookClient} = require("dialogflow-fulfillment");
//

const https = require("https");


// Enter your calendar ID below and service account JSON below

const serviceAccount = require("./service-account.json");
const calendarId = serviceAccount.calendarId;

// Email notification template and recipient email address
let htmlTemplate = null;
let emailRecipient = null;
const fileUrl = "./files/template.html"; // provide file location
const fs = require("fs");

fs.readFile(fileUrl, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  htmlTemplate = data;
});

// Set up Google Calendar Service account credentials
const serviceAccountAuth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: "https://www.googleapis.com/auth/calendar",
});

const calendar = google.calendar("v3");
process.env.DEBUG = "dialogflow:*"; // enables lib debugging statements

const timeZone = "America/Los_Angeles";
const timeZoneOffset = "-07:00";

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({request, response});
  const appointmentType = agent.parameters.AppointmentType;
  const emailAttendee = agent.parameters.email;
  emailRecipient = agent.parameters.email;
  const description = agent.parameters.description;

  // Set up PostoHub Service account credentials

  const apikey = serviceAccount.postohubEmailApiKey;
  const data = JSON.stringify({
    "sender_id": 106,
    "content": {
      "html": htmlTemplate,
    },
    "to": {
      "name": emailRecipient,
      "email": emailRecipient,
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
      "X-API-KEY": apikey,
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


  // eslint-disable-next-line valid-jsdoc
  /**
   * Make appointment in service calendar.
   * @agent {object} Webhook class for custom messaging.
   * @return {*f} createCalendarEvent function call .
   */
  function makeAppointment(agent) {
    // Calculate appointment start and end datetimes (end = +1hr from start)
    const dateTimeStart = new Date(Date.parse(agent.parameters.date.split("T")[0] + "T" + agent.parameters.time.split("T")[1].split("-")[0] + timeZoneOffset));
    const dateTimeEnd = new Date(new Date(dateTimeStart).setHours(dateTimeStart.getHours() + 1));
    const appointmentTimeString = dateTimeStart.toLocaleString(
        "en-US",
        {month: "long", day: "numeric", hour: "numeric", timeZone: timeZone}
    );
    // Check the availibility of the time, and make an appointment if there is time on the calendar
    return createCalendarEvent(dateTimeStart, dateTimeEnd, appointmentType, emailAttendee, description).then(() => {
      agent.add(`Ok, let me see if we can fit you in. ${appointmentTimeString} is fine!. I sent you my resume as well.`);
    }).catch((e) => {
      agent.add(`I'm sorry, there are no slots available for ${appointmentTimeString}.`);
    });
  }

  const intentMap = new Map();
  intentMap.set("Schedule Appointment", makeAppointment);
  agent.handleRequest(intentMap);
});


// eslint-disable-next-line require-jsdoc,valid-jsdoc
/**
 * Create appointment in service calendar.
 * @dateTimeStart {String} Start time of event.
 * @dateTimeEnd {String} End time of event.
 * @appointmentType {String} Appointment type: interview / meeting.
 * @emailAttendee {String} Attendee email address.
 * @description {String} Description.
 * @return {void} execution.
 */
function createCalendarEvent(dateTimeStart, dateTimeEnd, appointmentType, emailAttendee, description) {
  return new Promise((resolve, reject) => {
    calendar.events.list({
      auth: serviceAccountAuth, // List events for time period
      calendarId: calendarId,
      timeMin: dateTimeStart.toISOString(),
      timeMax: dateTimeEnd.toISOString(),
    }, (err, calendarResponse) => {
      // Check if there is a event already on the Calendar
      if (err || calendarResponse.data.items.length > 0) {
        reject(err || new Error("Requested time conflicts with another appointment"));
      } else {
        // Create event for the requested time period
        calendar.events.insert({auth: serviceAccountAuth,
          calendarId: calendarId,
          resource: {
            summary: appointmentType +" Appointment", description: appointmentType + " " + emailAttendee + "  " + description,
            start: {dateTime: dateTimeStart},
            end: {dateTime: dateTimeEnd}},
        }, (err, event) => {
              err ? reject(err) : resolve(event);
        }
        );
      }
    });
  });
}

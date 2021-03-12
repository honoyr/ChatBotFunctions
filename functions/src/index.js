
/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 */

"use strict";

import {sendEmail} from "./services";

import * as functions from "firebase-functions";
import cors from "cors";
const corsHandler = cors({origin: true});
import admin from "firebase-admin";
import serviceAccount from "./config/serviceAccount";
import {WebhookClient} from "dialogflow-fulfillment";

import {google} from "googleapis";

console.log("\n\nSERVICE_ACC" + JSON.stringify(serviceAccount)); // DEL

// Enter your calendar ID below and service account JSON below

const calendarId = serviceAccount.calendarId;

// Email notification template and recipient email address
let htmlTemplate = null;
// const emailRecipient = null;
const fileUrl = "./files/template.html"; // provide file location
import fs from "fs";

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


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dialogflow-d683a-default-rtdb.firebaseio.com",
});

// Instantiates a session client
import {SessionsClient} from "dialogflow";


exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  try {
    console.log("\n\nBODY" + JSON.stringify(request.body) + "\n\n");
    corsHandler(request, response, async () => {
      console.log("\n\nhere0\n\n");
      const {queryInput, sessionId} = request.body;
      console.log("\n\nhere1\n\n");
      const sessionClient = new SessionsClient({credentials: serviceAccount});
      console.log("\n\nhere2\n\n");
      const session = sessionClient.sessionPath("dialogflow-d683a", sessionId);
      console.log("\n\nSESSION =" + JSON.stringify(session));
      console.log("\n\nhere3\n\n");
      console.log("\n\n sessionClient2 =" + JSON.stringify(sessionClient));
      const responses = await sessionClient.detectIntent({session, queryInput});
      const result = responses[0].queryResult;
      console.log("RESULT = " + result);
      response.send(result);
    });
  } catch (err) {
    console.log("That did not go well. = " + err);
  }
  // corsHandler(request, response, () => {
  //   response.send(`Ping from Firebase (with CORS handling)! ${new Date().toISOString()}`);
  // });
});


export const dialogflowWebhook = functions.https.onRequest(async (request, response) => {
  const agent = new WebhookClient({request, response});

  console.log(JSON.stringify(request.body));

  const result = request.body.queryResult;

  // eslint-disable-next-line require-jsdoc
  function welcome(agent) {
    agent.add("Welcome to my agent!");
  }

  // eslint-disable-next-line require-jsdoc
  function fallback(agent) {
    agent.add("Sorry, can you try again?");
  }

  // eslint-disable-next-line require-jsdoc
  async function userOnboardingHandler(agent) {
    const db = admin.firestore();
    const profile = db.collection("users").doc("jeffd23");

    const {name, color} = result.parameters;

    await profile.set({name, color});
    agent.add("Welcome aboard my friend!");
  }

  const appointmentType = agent.parameters.AppointmentType;
  const emailAttendee = agent.parameters.email;
  const description = agent.parameters.description;

  // eslint-disable-next-line valid-jsdoc
  /**
   * Make appointment in service calendar.
   * @agent {object} Webhook class for custom messaging.
   * @return {*f} createCalendarEvent function call .
   * @dateTimeStart data time start.
   * @dateTimeEnd data time end.
   * @appointmentTimeString transformed time to convention time standart.
   */
  function makeAppointment(agent) {
    // Calculate appointment start and end datetimes (end = +1hr from start)
    const dateTimeStart = new Date(Date.parse(agent.parameters.date.split("T")[0] + "T" + agent.parameters.time.split("T")[1].split("-")[0] + timeZoneOffset));
    const dateTimeEnd = new Date(new Date(dateTimeStart).setHours(dateTimeStart.getHours() + 1));
    const appointmentTimeString = dateTimeStart.toLocaleString(
        "en-US",
        {month: "long", day: "numeric", hour: "numeric", timeZone: timeZone},
    );
    // Check the availibility of the time, and make an appointment if there is time on the calendar

    return createCalendarEvent(dateTimeStart, dateTimeEnd, appointmentType, emailAttendee, description).then(() => {
      sendEmail(emailAttendee, htmlTemplate);
      agent.add(`Ok, let me see if we can fit you in. ${appointmentTimeString} is fine!. I sent you my resume as well.`);
    }).catch((e) => {
      console.log("\n\nERROR = " + e);
      agent.add(`I'm sorry, there are no slots available for ${appointmentTimeString}.`);
    });
  }


  const intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("UserOnboarding", userOnboardingHandler);
  intentMap.set("Schedule Appointment", makeAppointment);
  agent.handleRequest(intentMap);
});


// eslint-disable-next-line valid-jsdoc
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
        },
        );
      }
    });
  });
}

import * as functions from "firebase-functions";
import {WebhookClient} from "dialogflow-fulfillment";
import admin from "firebase-admin";
import {sendEmailByPath} from "../services";
import {APPOINTMENT} from "../const";

import createCalendarEvent from "../services/calendarEvents/createCalendarEvent";


const timeZone = "America/Los_Angeles";
const timeZoneOffset = "-04:00";

exports.dialogflowWebhook = functions.https.onRequest(async (request, response) => {
  const agent = new WebhookClient({request, response});

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
      sendEmailByPath(emailAttendee, APPOINTMENT);
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

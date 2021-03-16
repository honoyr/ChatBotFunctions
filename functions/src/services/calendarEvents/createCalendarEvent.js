import serviceAccount from "../../config/serviceAccount";
import {google} from "googleapis";

// Set up Google Calendar Service account credentials
const serviceAccountAuth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: "https://www.googleapis.com/auth/calendar",
});

const calendar = google.calendar("v3");
process.env.DEBUG = "dialogflow:*"; // enables lib debugging statements
const calendarId = serviceAccount.calendarId;

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
export default function createCalendarEvent(dateTimeStart, dateTimeEnd, appointmentType, emailAttendee, description) {
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


import * as functions from "firebase-functions";
import cors from "cors";
const corsHandler = cors({origin: true});
import serviceAccount from "../config/serviceAccount";

// Instantiates a session client
import {SessionsClient} from "dialogflow";


exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  try {
    corsHandler(request, response, async () => {
      const {queryInput, sessionId} = request.body;
      const sessionClient = new SessionsClient({credentials: serviceAccount});
      const session = sessionClient.sessionPath("dialogflow-d683a", sessionId);
      const responses = await sessionClient.detectIntent({session, queryInput});
      const result = responses[0].queryResult;
      response.send(result);
    });
  } catch (err) {
    console.log("That did not go well. = " + err);
  }
});

// export default ServiceRepository;

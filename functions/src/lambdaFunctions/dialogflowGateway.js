
import * as functions from "firebase-functions";
import cors from "cors";
const corsHandler = cors({origin: true});
import serviceAccount from "../config/serviceAccount";

// Instantiates a session client
import {SessionsClient} from "dialogflow";


exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  try {
    // console.log("\n\nBODY" + JSON.stringify(request.body) + "\n\n");
    corsHandler(request, response, async () => {
      // console.log("\n\nhere0\n\n");
      const {queryInput, sessionId} = request.body;
      // console.log("\n\nhere1\n\n");
      const sessionClient = new SessionsClient({credentials: serviceAccount});
      // console.log("\n\nhere2\n\n");
      const session = sessionClient.sessionPath("dialogflow-d683a", sessionId);
      // console.log("\n\nSESSION =" + JSON.stringify(session));
      // console.log("\n\nhere3\n\n");
      // console.log("\n\n sessionClient2 =" + JSON.stringify(sessionClient));
      const responses = await sessionClient.detectIntent({session, queryInput});
      const result = responses[0].queryResult;
      // console.log("RESULT = " + result);
      response.send(result);
    });
  } catch (err) {
    console.log("That did not go well. = " + err);
  }
  // corsHandler(request, response, () => {
  //   response.send(`Ping from Firebase (with CORS handling)! ${new Date().toISOString()}`);
  // });
});

// export default ServiceRepository;

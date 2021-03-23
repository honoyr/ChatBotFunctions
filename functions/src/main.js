/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 */

"use strict";

import dialogflowGateway from "./lambdaFunctions/dialogflowGateway";
import dialogflowWebhook from "./lambdaFunctions/dialogflowWebhook";
import admin from "firebase-admin";
import serviceAccount from "./config/serviceAccount";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dialogflow-d683a-default-rtdb.firebaseio.com",
});

exports.dialogflowGateway = dialogflowGateway.dialogflowGateway;
exports.dialogflowWebhook = dialogflowWebhook.dialogflowWebhook;

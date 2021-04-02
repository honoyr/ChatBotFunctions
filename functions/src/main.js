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
import {FIREBASE_URL} from "./const";
import serviceAccount from "./config/serviceAccount";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_URL,
});

exports.dialogflowGateway = dialogflowGateway.dialogflowGateway;
exports.dialogflowWebhook = dialogflowWebhook.dialogflowWebhook;

## 1. Overview

This is the source code for the Interview ChatBot.

The ChatBot has the following features:
- it can answer common interview screening questions about my experience as a software engineer, programming skills, and work authorization status
- it can create a calendar event and set up a meeting with an interviewer
- it can send my resume to the interviewer


![ChatBotGif](https://user-images.githubusercontent.com/33399226/112348195-d4e0b500-8c84-11eb-93ec-21e1f3c5bec3.gif)

### Requirements

-  The IDE/text editor of your choice, such as  [WebStorm](https://www.jetbrains.com/webstorm),  [Atom](https://atom.io/),  [Sublime](https://www.sublimetext.com/), or  [VS Code](https://code.visualstudio.com/)
-   The package manager  [npm](https://www.npmjs.com/), which typically comes with  [Node.js](https://nodejs.org/en/)
-   A terminal/console
-   A browser of your choice, such as Chrome
- [Google Cloud Patform](https://cloud.google.com/)
- [DialogFlow Account](https://dialogflow.cloud.google.com/)
- [Firebase](https://console.firebase.google.com/) console

### Architecture

![Update Architecture diagram](https://lucid.app/publicSegments/view/bb25947e-2bad-4fe7-900b-1362567fba06/image.png)

## 2 Getting Started

Clone the [GitHub repository](https://github.com/honoyr/ChatBotFunctions)  from the command line:
```
git clone https://github.com/honoyr/ChatBotFunctions
```
Alternatively, if you do not have git installed, you can  [download the repository as a ZIP file](https://github.com/honoyr/ChatBotFunctions/archive/main.zip).

## 3. Create and set up a Firebase project

### **Create a Firebase project**

1.  Sign in to  [Firebase](https://console.firebase.google.com/).
2.  In the Firebase console, click  **Add Project**, and then name your Firebase project  **ChatBot**. Remember the project ID for your Firebase project.
3.  Click  **Create Project**.

**Important**: Your Firebase project will be named as **ChatBot**, but Firebase will automatically assign it a unique Project ID in the form  **ChatBot-1234**. This unique identifier is how your project is actually identified (including in the CLI), whereas  _ChatBot_  is simply a display name.

The application that we're going to build uses Firebase products that are available for web apps:


-   **Firebase Hosting**  to host and serve your assets.
-   **Firebase Cloud Functions**  serverless framework that automatically runs backend code in response to events triggered by **Firebase** features and HTTPS requests.

Some of these products need special configuration or need to be enabled using the Firebase console.

### Add a Firebase web app to the project

1.  Click the web icon  ![58d6543a156e56f9.png](https://firebase.google.com/codelabs/firebase-web/img/58d6543a156e56f9.png) to create a new Firebase web app.
2.  Register the app with the nickname  **ChatBot**, then check the box next to  **Also set up Firebase Hosting for this app**. Click  **Register app**.
3.  Click through the remaining steps. You don't need to follow the instructions now; these will be covered in later steps of this doc.

![ea9ab0db531a104c.png](https://firebase.google.com/codelabs/firebase-web/img/ea9ab0db531a104c.png)

## 4 Set up Google Cloud Platform API credentials

### DialogFlow API

- Open your [Google Cloud Patform](https://cloud.google.com/)
- Go to [API Library](https://console.cloud.google.com/apis/library)
- Enabel [DialogFlow API](https://console.cloud.google.com/apis/library/dialogflow.googleapis.com)
- Set up your [dialogflow service account](https://console.cloud.google.com/iam-admin/iam) permission to **Owner** role to get access to Dialogflow fulfillment from 3rd party services.
- Make sure your [firebase service account](https://console.cloud.google.com/iam-admin/iam) has **Owner** role as well.

### Google Calendar API

- Open your [Google Cloud Patform](https://cloud.google.com/)
- Go to [API Library](https://console.cloud.google.com/apis/library)
- Enabel [# Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
- Create `Service Account` and copy generated email address. Example: `interview-scheduler-calendar@<Project ID>.iam.gserviceaccount.com`
- Open your own google calendar or create a new one.
- Go to the [settings](https://share.getcloudapp.com/o0uE56NE)
- Add [ provided email](https://share.getcloudapp.com/nOulGoY1) address to section _Share with specific people_

## 5. Install the Firebase command-line interface

The Firebase command-line interface (CLI) allows you to use Firebase Hosting to serve your web app locally, as well as to deploy your web app to your Firebase project.

**Note**: To install the CLI, you need to install  [npm](https://www.npmjs.com/)  which typically comes with  [Node.js](https://nodejs.org/en/).

1.  Install the CLI by running the following npm command:

```
npm -g install firebase-tools
```

if it doesn't work, you may need to  [change npm permissions.](https://docs.npmjs.com/getting-started/fixing-npm-permissions)

2.  Verify that the CLI has been installed correctly by running the following command:

```
firebase --version
```

Make sure that the version of the Firebase CLI is v9 or later.

3.  Authorize the Firebase CLI by running the following command:

```
firebase login
```

We've set up the web app template to pull your app's configuration for Firebase Hosting from your app's local directory (the repository that you cloned earlier). But to pull the configuration, we need to associate your app with your Firebase project.

4.  Make sure that your command line is accessing your app's local  `root`  project directory.
5.  Associate your app with your Firebase project by running the following command:

```
firebase use --add
```

6.  When prompted, select your  **Project ID**, then give your Firebase project an alias. `.firebaserc` file

An alias is useful if you have multiple environments (production, staging, etc).

7.  Follow the remaining instructions on your command line.
8. `.firebaserc` file will be set up with your **Project ID**
```
{  
  "projects": {  
    "default": "<Project ID>"  
  }  
}
```
## 6. Installing dependency

### Functions

- Go to functions directory ```cd functions```
- Install dependency ```npm install```

## 7.  Setting up credentials

### Google Service Account

- Add to your `config` folder credentials
- Go to `cd functions/src/config`
- Create `serviceAccount.js`
- Open [Firebase console](https://share.getcloudapp.com/BluYkxm9)
- Open _Service accounts_ tab and press [Generate key](https://share.getcloudapp.com/5zuAQN60) button
- Save your json to `serviceAccount.js` as

```
export default {
  "type": "service_account",  
  "project_id": "<Project_ID>",  
  "private_key_id": "4291b7e4eea9*****2c15a3cfe9645",  
  "private_key": "-----BEGIN PRIVATE KEY-----\nMr***********0=\n-----END PRIVATE KEY-----\n",  
  "client_email": "firebase-***********@<PROJECT_ID>.iam.gserviceaccount.com",  
  "client_id": "1***********51",  
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",  
  "token_uri": "https://oauth2.googleapis.com/token",  
  "auth_provider_x**9_cert_url": "https://www.googleapis.com/oauth2/v1/certs",  
  "client_x**9_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/*******.iam.gserviceaccount.com", 
};
```
### Google calendar ID
- Copy your [Calendar ID](https://share.getcloudapp.com/RBu48j0b) from your calendar
- Add new line to your `serviceAccount.js` file such as  `"calendarId": "*******@group.calendar.google.com",`

### Email API
- Register on [PostoHub](https://app.postohub.io/sign-in) (Email Service Provider)
- Go to [integration section](https://app.postohub.io/profile/integration) and create your API key.
- Add generated API key to your `serviceAccount.js`
```
"postohubEmailApiKey": "*******-9a5dd7***"
```
At the end `serviceAccount.js` looks like

```
export default {
  "type": "service_account",  
  "project_id": "<Project_ID>",  
  "private_key_id": "4291b7e4eea9*****2c1**45",  
  "private_key": "-----BEGIN PRIVATE KEY-----\nMr***********0=\n-----END PRIVATE KEY-----\n",  
  "client_email": "firebase-***********@<PROJECT_ID>.iam.gserviceaccount.com",  
  "client_id": "1***********51",  
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",  
  "token_uri": "https://oauth2.googleapis.com/token",  
  "auth_provider_x**9_cert_url": "https://www.googleapis.com/oauth2/v1/certs",  
  "client_x**9_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/*******.iam.gserviceaccount.com",  
  "calendarId": "*******@group.calendar.google.com",  
  "postohubEmailApiKey": "*******-9a5dd7***",  
};
```
## Deployment

### Functions
- Open the directory with your functions `cd functions`

#### Local environment
- Run your functions locally `npm run-script serve`. It allows to test the functions out first via any HTTP Requests simulator.

#### Production environment
- Run deployment script to host functions in production `npm run-script deploy`

### Web Application
- Open `cd chatBotUi` directory
- Run `npm install` to install dependencies

#### Local environment
- Open `cd chatBotUi` directory
- Change URL in `.env` file to local cloud function endpoint `LOCAL_DIALOGFLOW_GATEWAY=http://localhost:5001/<Project_ID>/us-central1/dialogflowGateway` before running locally
- Build project with the command `ng build`. The compiled app is stored in the root directory `cd ../public/`
- Run your functions locally `cd ../functions && npm run-script serve`
- Open http://localhost:5000

#### Production environment
- Open `cd chatBotUi` directory
- Build project with the command `ng build`. The compiled app is stored in the root directory `cd ../public/`
- Change URL in `.env` file to cloud function endpoint `PROD_DIALOGFLOW_GATEWAY=https://us-central1-<Project_ID>.cloudfunctions.net/dialogflowGateway` before running in production
- Run your functions on the host `cd ../functions && npm run-script deploy`
- Open your firebase hosting https://<Project_ID>.web.app/
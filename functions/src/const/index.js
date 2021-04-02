import dotenv from "dotenv";
dotenv.config();

/**
 * Paths
 */
export const RESUME = "../../../files/resume.html";
export const APPOINTMENT = "../../../files/template.html";

/**
 * API
 */
export const GPT3APIkey = process.env.OPENAI_API_KEY;


/**
 * Project GCP
 */

export const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
export const FIREBASE_URL = process.env.FIREBASE_URL;


/**
 * Settings
 */

export const TIME_ZONE = "America/Los_Angeles";
export const TIME_ZONE_OFFSET = "-07:00";

/**
 * Email Client
 */

export const NAME = "Dennis Gonor";
export const EMAIL_TO = "dennis.gonor@gmail.com";
export const SUBJECT = "Dennis Gonor SE Resume";
export const PREVIEW_MSG = "Resume";

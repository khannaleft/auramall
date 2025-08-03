
import {onRequest, Request, Response} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as crypto from "crypto";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// --- IMPORTANT ---
// Set these in your Firebase project environment using the Firebase CLI:
// firebase functions:config:set payu.key="your_payu_key"
// firebase functions:config:set payu.salt="your_payu_salt"
const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT;

/**
 * Generates a secure PayU hash on the server.
 * Expects a POST request with payment details.
 */
export const generatePayuHash = onRequest({ cors: true }, (request: Request, response: Response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    if (!PAYU_KEY || !PAYU_SALT) {
      logger.error("PayU key or salt is not configured in environment variables.");
      response.status(500).json({error: "Server configuration error."});
      return;
    }

    const {total, productinfo, firstname, email, txnid} = request.body;

    if (!total || !productinfo || !firstname || !email || !txnid) {
      response.status(400).json({error: "Missing required payment details."});
      return;
    }

    const amount = Number(total).toFixed(2);
    // Corrected hash string with 10 empty UDF fields, as per PayU's requirement.
    const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    logger.info(`Generated hash for txnid: ${txnid}`);
    response.status(200).json({success: true, hash});
});


/**
 * Webhook to verify PayU payment status after redirect.
 * This is called by PayU's servers, not your app.
 */
export const verifyPayuPayment = onRequest({ cors: true }, async (request: Request, response: Response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const {status, txnid, hash, email, firstname, productinfo, amount} = request.body;
    logger.info(`Received webhook for txnid: ${txnid} with status: ${status}`);

    if (!status || !txnid || !hash || !email || !firstname || !productinfo || !amount || !PAYU_KEY || !PAYU_SALT) {
      logger.error("Webhook missing required fields or server config.", {body: request.body});
      response.status(400).send("Invalid request.");
      return;
    }

    // --- Hash Verification ---
    // This is the most critical step to prevent fraud.
    // We recalculate the hash on our server and compare it to the one PayU sent.
    const hashString = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
    const recomputedHash = crypto.createHash("sha512").update(hashString).digest("hex");

    if (recomputedHash !== hash) {
      logger.error(`Hash mismatch for txnid: ${txnid}. Potential fraud attempt.`);
      await db.collection("orders").doc(txnid).update({
        status: "Cancelled",
        notes: "Payment verification failed (hash mismatch).",
      });
      response.status(400).send("Hash verification failed.");
      return;
    }

    // --- Update Order Status in Firestore ---
    try {
      const orderRef = db.collection("orders").doc(txnid);
      if (status === "success") {
        await orderRef.update({status: "Processing"});
        logger.info(`Order ${txnid} successfully updated to Processing.`);
        // Here you could also trigger sending a confirmation email, etc.
      } else {
        await orderRef.update({status: "Cancelled", notes: "Payment failed or was cancelled by user."});
        logger.warn(`Order ${txnid} marked as Cancelled due to failure status.`);
      }
      response.status(200).send("Webhook processed successfully.");
    } catch (error) {
      logger.error(`Failed to update Firestore for txnid: ${txnid}`, error);
      response.status(500).send("Error updating order status.");
    }
});

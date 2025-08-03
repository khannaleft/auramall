

import type { NextApiRequest, NextApiResponse } from 'next';
import * as crypto from 'crypto';
import { db } from '../../lib/firebaseAdmin';
import { Product } from '@/types';

// Helper to set CORS headers for PayU's webhook requests.
const allowCors = (fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for the webhook
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    return await fn(req, res);
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  
  const PAYU_KEY = process.env.PAYU_KEY;
  const PAYU_SALT = process.env.PAYU_SALT;

  const { status, txnid, hash, email, firstname, productinfo, amount } = req.body;
  console.log(`Received webhook for txnid: ${txnid} with status: ${status}`);

  if (!status || !txnid || !hash || !email || !firstname || !productinfo || !amount || !PAYU_KEY || !PAYU_SALT) {
    console.error("Webhook missing required fields or server config.", { body: req.body });
    return res.status(400).send("Invalid request: missing fields.");
  }

  // --- Hash Verification ---
  const hashString = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
  const recomputedHash = crypto.createHash("sha512").update(hashString).digest("hex");

  if (recomputedHash !== hash) {
    console.error(`Hash mismatch for txnid: ${txnid}. Potential fraud attempt.`);
    return res.status(400).send("Hash verification failed.");
  }
  
  const orderRef = db.collection("orders").doc(txnid);

  try {
    if (status === "success") {
        await db.runTransaction(async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists) {
                throw new Error(`Order ${txnid} not found.`);
            }
            if (orderDoc.data()?.status === 'Processing') {
                console.log(`Order ${txnid} is already processed. Skipping stock deduction.`);
                return; // Idempotency check
            }
            const orderData = orderDoc.data();
            if (!orderData || !orderData.items || orderData.items.length === 0) {
                 throw new Error(`Order ${txnid} has no items.`);
            }

            const productReads = orderData.items.map((item: { id: number; quantity: number }) => {
                const productRef = db.collection('products').doc(item.id.toString());
                return transaction.get(productRef).then(productSnap => ({ productSnap, item, productRef }));
            });

            const productDetails = await Promise.all(productReads);

            for (const { productSnap, item, productRef } of productDetails) {
                if (!productSnap.exists) throw new Error(`Product with ID ${item.id} not found.`);
                
                const productData = productSnap.data() as Product;
                const newStock = productData.stock - item.quantity;
                
                if (newStock < 0) {
                    throw new Error(`Critical Error: Not enough stock for ${productData.name} to fulfill order ${txnid}.`);
                }
                transaction.update(productRef, { stock: newStock });
            }
            transaction.update(orderRef, { status: "Processing" });
        });
        console.log(`Order ${txnid} processed successfully: stock deducted and status updated.`);
    } else {
        const doc = await orderRef.get();
        if (doc.exists) {
            await orderRef.update({ status: "Cancelled", notes: `Payment ${status} by user.` });
            console.warn(`Order ${txnid} marked as Cancelled due to status: ${status}.`);
        }
    }
    return res.status(200).send("Webhook processed successfully.");
  } catch (error: any) {
    console.error(`Transaction for txnid ${txnid} failed:`, error);
     try {
        await orderRef.update({
            status: "Cancelled",
            notes: `Payment succeeded but order processing failed. Needs manual review. Reason: ${error.message}`
        });
    } catch (updateError) {
        console.error(`CRITICAL: Failed to mark order ${txnid} as failed after transaction error.`, updateError);
    }
    return res.status(500).send("Error updating order status post-payment.");
  }
}

export default allowCors(handler);
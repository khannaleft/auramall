import type { NextApiRequest, NextApiResponse } from 'next';
import * as crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { PAYU_KEY, PAYU_SALT } = process.env;
  if (!PAYU_KEY || !PAYU_SALT) {
    return res.status(500).json({ error: "Missing PAYU_KEY or PAYU_SALT" });
  }

  const { total, productinfo, firstname, email, txnid } = req.body;

  if (!total || !productinfo || !firstname || !email || !txnid) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const amount = parseFloat(total).toFixed(2); // Ensure two decimal places like "97.20"

  const hashString = [
    PAYU_KEY.trim(),
    txnid.trim(),
    amount,
    productinfo.trim(),
    firstname.trim(),
    email.trim(),
    '', '', '', '', '', '', '', '', '', '', // udf1 to udf10 and 5 extra empty placeholders
    PAYU_SALT.trim()
  ].join('|');

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  console.log("txnid:", txnid);
  console.log("amount:", amount);
  console.log("hashString:", hashString);
  console.log("hash:", hash);

  return res.status(200).json({ success: true, hash });
}

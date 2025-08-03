
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Handles the client-side redirect from PayU after a payment attempt.
 * PayU sends a POST request to this endpoint. This handler reads the
 * payment status and then performs a server-side redirect (HTTP 303)
 * to send the user to the correct UI page with a GET request. This
 * avoids having a POST request made directly to a UI page.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { status, txnid } = req.body;

    if (status === 'success') {
      // On success, build the redirect URL with query params.
      const successUrl = `/orders?payment=success&order_id=${txnid || ''}`;
      // Use HTTP 303 See Other for the POST-redirect-GET pattern.
      res.redirect(303, successUrl);
    } else {
      // On failure, redirect to the home page with a failure param.
      const failureUrl = `/?payment=failure&order_id=${txnid || ''}`;
      res.redirect(303, failureUrl);
    }
  } catch (error) {
    console.error('Error in payment return handler:', error);
    // Fallback redirect to home page on error.
    res.redirect(303, '/');
  }
}

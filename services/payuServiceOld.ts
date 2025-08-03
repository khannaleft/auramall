
import { User, CartItem } from '../types';

// Use the local Next.js API route for generating the hash.
const GENERATE_HASH_URL = "/api/generateHash";

// PayU Test Key (this is public and safe to have on the client)
const PAYU_KEY = 'ykKLPl';

interface PaymentDetails {
    user: User;
    cartItems: CartItem[];
    phone: string;
    total: number;
    txnid: string; // The transaction ID (order ID) is now required
}

/**
 * Creates and submits a form to redirect the user to the PayU payment gateway.
 */
const postToPayU = (data: any) => {
    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    // This is the PayU endpoint for test transactions
    form.action = 'https://test.payu.in/_payment'; 

    // Add all payment details as hidden input fields
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = data[key];
            form.appendChild(hiddenField);
        }
    }

    // Append the form to the body and submit it, which triggers the redirect
    document.body.appendChild(form);
    form.submit();
};


/**
* Initiates a payment with PayU by calling our secure backend.
* This function will redirect the user away from the site.
*/
export const initiatePayUPayment = async (details: PaymentDetails): Promise<void> => {
    console.log("1. Calling secure API route to get payment hash...");

    const { user, cartItems, total, phone, txnid } = details;
    const productinfo = cartItems.map(item => item.name).join(', ');
    const firstname = user.name.split(' ')[0] || '';

    // Step 1: Call our secure API route to get the hash
    const hashResponse = await fetch(GENERATE_HASH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            total,
            productinfo,
            firstname,
            email: user.email,
            txnid,
        }),
    });

    if (!hashResponse.ok) {
        const error = await hashResponse.json();
        console.error("Failed to get payment hash:", error);
        throw new Error(error.error || "Could not connect to payment server.");
    }

    const { hash } = await hashResponse.json();
    console.log("2. Received secure hash from server for txnid:", txnid);

    // This is our new API route that handles the POST from PayU and redirects the client.
    const RETURN_URL = `${window.location.origin}/api/paymentReturn`;

    // Step 2: Prepare the full data payload for PayU
    const paymentData = {
        key: PAYU_KEY,
        txnid,
        amount: total.toFixed(2),
        productinfo,
        firstname,
        email: user.email,
        phone,
        // Both surl and furl now point to our new API endpoint which handles the POST.
        // This endpoint will then redirect the user to the correct UI page using a GET request.
        surl: RETURN_URL,
        furl: RETURN_URL,
        hash, // The secure hash from our server
    };

    console.log("3. Data ready. Redirecting to PayU gateway...");

    // Step 3: This function creates and submits a form, redirecting the user to PayU
    postToPayU(paymentData);

    // Note: No promise is returned for success/failure because the browser is
    // navigating away from this page. The result is handled by the redirect URLs (surl/furl).
};

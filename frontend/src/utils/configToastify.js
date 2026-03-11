import { Bounce, toast } from 'react-toastify'

const configToastify = {
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
    transition: Bounce
}
export default function Notification({ message, type, options }) {
    let displayMessage = message;

    // Handle complex error objects (like express-validator format)
    if (message && typeof message === 'object') {
        if (message.errors && Array.isArray(message.errors) && message.errors.length > 0) {
            // Priority 1: Use the first validation error message
            displayMessage = message.errors[0].msg;
        } else if (message.message) {
            // Priority 2: Use message property
            displayMessage = message.message;
        } else if (message.title) {
            // Priority 3: Use title property
            displayMessage = message.title;
        } else {
            // Fallback for objects: stringify or use generic
            displayMessage = JSON.stringify(message);
        }
    }

    // Final fallback for null/undefined/empty
    if (!displayMessage || displayMessage === "undefined" || displayMessage === "") {
        displayMessage = type === "error" ? "Something went wrong. Please try again." : "Action completed.";
    }
    
    if (type === "error") {
        console.error("Notification Error Details:", message);
    }

    return toast[type](displayMessage, { ...configToastify, ...options })
}



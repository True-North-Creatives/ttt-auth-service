import axios from 'axios';
import logger from 'ttt-packages/lib/config/logger';

export const sendWelcomeMail = async (email, name) => {
    const payload = {
        name,
    };
    const { status, data } = await axios.post(
        `${process.env.MAIL_ENDPOINT}/api/v2/mail/welcome/${email}`,
        payload,
        { withCredentials: true, validateStatus: (status)=> status <= 503 }
    );
    return { status, data };
};

export const sendPasswordResetMail = async (email, name, redirecturl) => {
    const payload = {
        name,
        redirecturl,
    };
    const { status, data } = await axios.post(
        `${process.env.MAIL_ENDPOINT}/api/v2/mail/reset/${email}`,
        payload,
        { withCredentials: true, validateStatus: (status)=> status <= 503 }
    );
    console.log(status, 'here');
    return { status, data };
};

export const sendConfirmationMail = async (email, redirecturl) => {
    const payload = {
        redirecturl,
    };
    const { status, data } = await axios.post(
        `${process.env.MAIL_ENDPOINT}/api/v2/mail/confirm/${email}`,
        payload,
        { withCredentials: true, validateStatus: (status)=> status <= 503 }
    );
    return { status, data };
};

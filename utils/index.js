const nodemailer = require("nodemailer");


const calculateFormattedAddress = (address) => {
    return `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.country} - ${address.pincode}`
}

const json = (param) => {
    return JSON.stringify(
        param,
        (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    );
};


const sendMail = (to, subject, emailText, emailHTML) => {

    let transporter = nodemailer.createTransport({
        host: 'live.smtp.mailtrap.io',
        port: 587,

        auth: {
            user: 'api',
            pass: '4deb65af0d8e68f9c5f4cd5d606d85e7'

        }
    });

    return transporter.sendMail({
        from: 'mailtrap@demomailtrap.com', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: emailText, // plain text body
        html: emailHTML, // html body
    });
}

const getPasswordResetEmailTemplate = (passwordResetLink) => {
    return `
    <h1>Please reset your password</h1>
    <div>
        <p>Hello,</p>
        <p>We have sent you this email in response to your request to reset your password on DSA Window.</p>
        <p>To reset your password, please follow the link below:</p>
    
    </div>
    <a href=${passwordResetLink} class="reset-password-btn">Reset Password</a>`
}

const getEmailVerificationTemplate = (emailVerifyLink) => {
    return `
    <h1>Please verify email</h1>
    <div>
        <p>Hello,</p>
        <p>We have sent you this email in response to verify your email on DSA Window.</p>
        <p>To verify your email, please follow the link below</p>
    
    </div>
    <a href=${emailVerifyLink} class="reset-password-btn">Verify Email</a>`
}



module.exports = { calculateFormattedAddress, json, sendMail, getPasswordResetEmailTemplate, getEmailVerificationTemplate };
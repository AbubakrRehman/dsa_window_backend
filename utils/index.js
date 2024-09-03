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

    return transporter.sendMail({
        from: email, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: emailText, // plain text body
        html: emailHTML, // html body
    });

}


module.exports = { calculateFormattedAddress, json, sendMail };
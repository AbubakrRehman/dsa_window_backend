const calculateFormattedAddress = (address) => {
    return `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.country} - ${address.pincode}`
}

const json = (param) => {
    return JSON.stringify(
        param,
        (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    );
};


module.exports = { calculateFormattedAddress, json };
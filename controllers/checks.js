const phoneNormalizer = require('phone');
const zxcvbn = require('zxcvbn');

const defaultValue = require('../models/default-values');
const formFields = require('../models/forms-default-fields');
const timeValue = require('../models/time-values');
const { getCompanyServicesFromUserValues } = require('./logic-user-accounts');

exports.checkAreAllAccountPropertiesFilled = function(sessionUserValues, currentProperty) {

    let userProperties = JSON.parse(JSON.stringify(sessionUserValues));

    // These 3 are allowed to be empty so delete them.
    delete userProperties.companyDescription;
    delete userProperties.companyStreetTwo;
    delete userProperties.companyWebsite;

    // The current property has a value or you wouldn't get here.  However it hasn't been updated on the session so it is allowed to be empty.  Delete that property.
    if (currentProperty === 'companyAddress') {

        delete userProperties.companyCity;
        delete userProperties.companyState;
        delete userProperties.companyStreet;
        delete userProperties.companyZip;
        delete userProperties.companyLatitude;
        delete userProperties.companyLongitude;

    } else if (currentProperty !== 'companyServices') {

        delete userProperties[currentProperty];

    }

    // If any remaining property is empty return false.
    for (var key in userProperties) {

        if (userProperties[key] === '') return false;
            
    }

    // Company services have to be checked separately.  Don't check if you are at postAddChangeCompanyServices.
    // In postAddChangeCompanyServices you wouldn't get here if all company services were empty because isAtLeastOneCompanyServiceFilled would redirect you.
    if (currentProperty !== 'companyServices') {

        let companyServiceProperties = [...formFields.addChangeCompanyServices];

        // Remove deleteProperty because it isn't needed for this test.
        let indexOfDeleteProperty = companyServiceProperties.indexOf('deleteProperty');
        companyServiceProperties.splice(indexOfDeleteProperty, 1);

        for (var element of companyServiceProperties) {

            if (userProperties[element] === true) return true;
    
        }

        return false;

    }

    return true;

}

exports.checkDoAnyCompanyServicesHaveValue = function (
    boardingSecuring,
    debrisRemovalTrashout,
    evictionManagement,
    fieldInspection,
    handymanGeneralMaintenance,
    landscapeMaintenance,
    lockChanges,
    overseePropertyRehabilitation,
    poolMaintenance,
    propertyCleaning,
    winterizations
    ) {

    for (const value of arguments) {
        if (value === true) return true;
    }

    return false;

}

exports.checkIfAllContentGenuine = function(defaultSubmissionFields, request) {

    let isKeyGenuine;
    for (const key in request) {

        isKeyGenuine = defaultSubmissionFields.includes(key);
        if (isKeyGenuine === false) return false;

    }

    return true;

}

exports.checkIfAllContentSubmitted = function(defaultSubmissionFields, request) {

    for (const value of defaultSubmissionFields) {

        if (request.hasOwnProperty(value) === false) {
            return false;
        }

    }

    return true;

}

exports.checkIfAtLeastOneCompanyServiceFilled = function(cleanedFormWithBoolean) {

    let listOfCompanyServices = defaultValue.listOfCompanyServices;

    for (const value of listOfCompanyServices) {
        if (cleanedFormWithBoolean[value] === true) return true;
    }

    return false;

};

exports.checkIfCompanyAddressNormalized = function(
    companyStreet,
    companyStreetTwo,
    companyCity,
    companyState,
    companyZip,
    normalizedCompanyAddress
    ) {

    if (
        normalizedCompanyAddress.street1 === companyStreet &&
        normalizedCompanyAddress.street2 === companyStreetTwo &&
        normalizedCompanyAddress.city === companyCity &&
        normalizedCompanyAddress.state === companyState &&
        normalizedCompanyAddress.Zip5 === companyZip
    ) return true;

    return false;
    
}

exports.checkIfCompanyPhoneValid = function(companyPhone) {

    // If phoneNormalizer returns an empty array it indicates that the phone number is not complete or valid.
    if (phoneNormalizer(companyPhone, '', true).length === 0) return false;

    // A real phone number in the correct format can't start with a 0 or 1.
    if (companyPhone.charAt(0) == 0 || companyPhone.charAt(0) == 1) return false;

    return true;
    
}

exports.checkIfCompanyServicesUnchanged = function(reqSessionUserValues, listOfServicesObject) {

    for (const key in listOfServicesObject) {
        if (listOfServicesObject[key] !== reqSessionUserValues[key]) return false;
    }

    return true;

}

exports.checkIfCompanyStateValid = function(companyState) {

    let states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC', ''];

    let wasStateValid = states.includes(companyState);

    if (wasStateValid === true) return true;
    
    return false;

}

exports.checkIfDeletePropertyCorrectlySet = function(reqBody) {

    // deleteProperty is used in many routes.  If it is present make sure the value is either true or empty string.
    if (reqBody.deleteProperty) {

        if (reqBody.deleteProperty === 'true' || reqBody.deleteProperty === 'false') {

            return true;

        } else {

            return false;

        }

    }

    return true;

}

exports.checkIfPasswordMeetsRequirements = function(password) {

    let didPasswordMeetRequirements = zxcvbn(password).score >= 2;

    if (didPasswordMeetRequirements === true) return true;

    return false;

}

exports.checkIfServiceValuesValid = function(cleanedSubmission) {

    let listOfCompanyServices = defaultValue.listOfCompanyServices;

    for (const value of listOfCompanyServices) {
        if (cleanedSubmission[value] !== true && cleanedSubmission[value] !== false) return false;
    }

    return true;

}

exports.checkIfUpgradeExpirationSoon = function(numberOfDaysUntilExpiration) {

    // A negative number indicates this is a free account.
    if (numberOfDaysUntilExpiration < 0) return false;
    if (numberOfDaysUntilExpiration > timeValue.firstAlertBeforeExpiration) return false;

    return true;
    
}

exports.checkWereCompanyServicesAdded = function(companyServices, userValues) {

    // If any value is true that means a service already existed and the change is an update, not an add.
    for (const value of companyServices) {
        if (userValues[value] === true) return false;
    }

    return true;

};
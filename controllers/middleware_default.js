"use strict";

const { wrapAsync } = require('./logic_user_accounts');


exports.error500 = wrapAsync( async function(req, res, next) {

    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;

    res.render('error', { activeLink, loggedIn });
});

exports.errorHandler = function(error, req, res, next) {

    logger.log({
        time: new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }),
        level: 'error',
        message: error.message
    });

    res.redirect('/error500');
};

exports.foreclosureCleanupVendorList = wrapAsync(async function(req, res, next) {
    
    let loggedIn = req.session.userValues ? true : false;
    let activeLink = 'vendorList';

    res.render('foreclosure_cleanup_vendor_list', { loggedIn, activeLink });
});

exports.homePage = wrapAsync(async function(req, res, next) {
    
    let loggedIn = req.session.userValues ? true : false;
    let activeLink = 'home';

    res.render('index', { loggedIn, activeLink });
});

exports.pageNotFound = wrapAsync(async function(req, res, next) {

    // For rendering.
    let activeLink = null;
    let loggedIn = req.session.userValues ? true : false;
    
    res.status(404).render('page_not_found', { activeLink, loggedIn });
});

exports.privacyPolicyTermsService = wrapAsync(async function(req, res, next) {
    
    let loggedIn = req.session.userValues ? true : false;
    let activeLink = null;

    res.render('privacy_policy_terms_service', { loggedIn, activeLink });
});
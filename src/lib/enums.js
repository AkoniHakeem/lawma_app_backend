"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileTypes = exports.SubscriberProfileRoleEnum = exports.AppVerificationPivot = exports.AppVerificationType = exports.CacheNameEnum = exports.EmailPriority = exports.SignInTypeEnum = exports.TokenCreationPurpose = void 0;
var TokenCreationPurpose;
(function (TokenCreationPurpose) {
    TokenCreationPurpose["SIGN_UP"] = "sign_up";
    TokenCreationPurpose["RESET_PASSWORD"] = "reset_password";
    TokenCreationPurpose["ACCESS_TOKEN"] = "access_token";
    TokenCreationPurpose["INVITATION_TOKEN"] = "invitation_token";
    TokenCreationPurpose["SINGLE_SIGN_IN"] = "single_sign_in";
})(TokenCreationPurpose || (exports.TokenCreationPurpose = TokenCreationPurpose = {}));
var SignInTypeEnum;
(function (SignInTypeEnum) {
    SignInTypeEnum["FULL_AUTH"] = "full_auth";
    SignInTypeEnum["SINGLE_SIGN_IN"] = "single_signin";
})(SignInTypeEnum || (exports.SignInTypeEnum = SignInTypeEnum = {}));
var EmailPriority;
(function (EmailPriority) {
    EmailPriority["IMMEDIATE"] = "immediate";
    EmailPriority["REGULAR"] = "regular";
    EmailPriority["DELAYED"] = "delayed";
})(EmailPriority || (exports.EmailPriority = EmailPriority = {}));
var CacheNameEnum;
(function (CacheNameEnum) {
    CacheNameEnum["EMAIL_JOB"] = "email_job";
})(CacheNameEnum || (exports.CacheNameEnum = CacheNameEnum = {}));
var AppVerificationType;
(function (AppVerificationType) {
    AppVerificationType["LINK"] = "link";
    AppVerificationType["CODE"] = "code";
})(AppVerificationType || (exports.AppVerificationType = AppVerificationType = {}));
var AppVerificationPivot;
(function (AppVerificationPivot) {
    AppVerificationPivot["EMAIL"] = "email";
    AppVerificationPivot["PHONE"] = "phone";
    AppVerificationPivot["AUTHENTICATIOR_APP"] = "authenticator_app";
})(AppVerificationPivot || (exports.AppVerificationPivot = AppVerificationPivot = {}));
var SubscriberProfileRoleEnum;
(function (SubscriberProfileRoleEnum) {
    SubscriberProfileRoleEnum["OWNER"] = "owner";
    SubscriberProfileRoleEnum["CUSTODIAN"] = "custodian";
})(SubscriberProfileRoleEnum || (exports.SubscriberProfileRoleEnum = SubscriberProfileRoleEnum = {}));
var ProfileTypes;
(function (ProfileTypes) {
    ProfileTypes["ENTITY_USER_PROFILE"] = "entity_user_profile";
    ProfileTypes["ENTITY_SUBSCRIBER_PROFILE"] = "entity_subscriber_profile";
})(ProfileTypes || (exports.ProfileTypes = ProfileTypes = {}));

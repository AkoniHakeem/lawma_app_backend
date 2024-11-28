export enum TokenCreationPurpose {
  SIGN_UP = 'sign_up',
  RESET_PASSWORD = 'reset_password',
  ACCESS_TOKEN = 'access_token',
  INVITATION_TOKEN = 'invitation_token',
  SINGLE_SIGN_IN = 'single_sign_in',
}

export enum SignInTypeEnum {
  FULL_AUTH = 'full_auth',
  SINGLE_SIGN_IN = 'single_signin',
}

export enum EmailPriority {
  IMMEDIATE = 'immediate',
  REGULAR = 'regular',
  DELAYED = 'delayed',
}

export enum CacheNameEnum {
  EMAIL_JOB = 'email_job',
}

export enum AppVerificationType {
  LINK = 'link',
  CODE = 'code',
}

export enum AppVerificationPivot {
  EMAIL = 'email',
  PHONE = 'phone',
  AUTHENTICATIOR_APP = 'authenticator_app',
}

export enum SubscriberProfileRoleEnum {
  OWNER = 'owner',
  CUSTODIAN = 'custodian',
}

export enum ProfileTypes {
  ENTITY_USER_PROFILE = 'entity_user_profile',
  ENTITY_SUBSCRIBER_PROFILE = 'entity_subscriber_profile',
}

export enum Wallet_Service_Transaction_Type {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum Wallet_Service_Credit_Source_Type {
  WALLET = 'wallet',
  BANK = 'bank',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
}

export enum UpdatePropertySubscriptionAction {
  UPDATE_PROPERTY_NAME = 'update-property-name',
  UPDATE_PHONE = 'update-phone',
}

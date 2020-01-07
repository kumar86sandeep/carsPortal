// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // API_ENDPOINT: 'http://localhost:3000',
  API_ENDPOINT: 'https://api.carsgoat.com',
  WEB_ENDPOINT: 'http://localhost:4200',
  ADDRESS_API:{
    ENDPOINT:'https://us-zipcode.api.smartystreets.com',
    KEY: '17637041093054568',
    TOKEN: 'd379e2ad-8ebb-2acb-f7c3-f65ce0ae0d64',
  },
  VEHICLE_STATS_API: {
    ENDPOINT: 'https://www.carqueryapi.com/api/0.3',
  },

  FILE_UPLOAD_API: "http://localhost:3000/api/common/imageUploadtoBucket",
  APP_NAME: 'CarsGoat',
  DEFAULT_PROFILE: 'assets/images/default-user.png',
  DEFAULT_DEALERSHIP_PROFILE: 'assets/images/org.png',
  DEFAULT_COUNTRY_CODE: '+1',
  DEFAULT_RECORDS_LIMIT: 24,
  DEFAULT_PAGES_PAGINATION: 5, //Defines the maximum number of page links to display
  DEFAULT_PAGE_LIMIT_OPTIONS: [
    // { value: 6 },
    // { value: 12 },
    { value: 24 },
    { value: 48 },
    { value: 96 },
  ],

  // Paypal Client ID
  PAYPAL_CLIENT_ID: 'AQfA5nzAx7WkixB5bANwwv5wd--9KYCniND-qpUeHtdKGi9pHNnsFYeejAyNr6ovYpDd8iHXDc7hwIXi',

  //rating & review settings 
  MAX_RATE_STARS: 5,

  //aws 
  AWS: {
    ACCESS_KEY: '',
    SECRET_KEY: '',
    REGION: 'us-west-2',
    BUCEKT_NAME: 'topautobid-dev',
    COGNITO: {
      UserPoolId: 'us-west-2_psnR8GZRX',
      ClientId: '7c90u8uf8ulr5pu8m2blkgp5m'
    }

  },
  //social logins
  SOCIAL_LOGINS: {
    GOOGLE: {
      GOOGLE_0AUTH_CLIENT_ID: '702849135664-lvr6r5pdjjdprm6t66tdccp6e4v293o4.apps.googleusercontent.com',
      GOOGLE_0AUTH_CLIENT_SECRET:'0QWw5xHIr0sReaJtUG19XkC9'
    },
    FACEBOOK: {
      FACEBOOK_APP_ID: '2407497129310160',
    },
    MICROSOFT: {
      tenant: 'careportfol.io',
      clientId: '97598d97-5226-4286-bbf9-2a111f89af9d',
      endpoints: {
        'https://graph.microsoft.com': '00000003-0000-0000-c000-000000000000'
      }
    }
  },


  //manage web-product success/error messages 
  MESSAGES: {
    LOGIN_SUCCESS: 'Authorized & logged in successfully.',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    FORGOT_PASSWORD_SUCCESS: 'Forgot password instruction has been sent to your email',
    RESEND_VERIFICATION_SUCCESS: 'The verification link has been resent to your email successfully. Please Check your email.',
    VERIFICATION_PENDING: 'Verification code has been sent to your phone number. Please verify your account.',
    SIGNUP_SUCCESS: 'Congratulations!! Your account has been verified successfully and is ready to use.',
    SUCCESS_ADD: 'Has been added successfully.',
    SUCCESS_EDIT: 'Has been updated successfully.',
    SUCCESS_DELETE: 'Has been deleted successfully',
    LOGIN_FAILURE: 'Email/password do not match.',
    EMAIL_EXIST: 'Email already exist! Please try another one.',
    EMAIL_NOT_EXIST: 'Email does not exist.',
    ERROR_TEXT_LOADER: 'Oops got error...',
    UPLOAD_SUCCESS: 'Has been uploaded successfully.',
    UPLOAD_ERROR: 'We got some error in upload.',
    MAIL_SENT: 'Mail has been sent. Please check your inbox.',
    OTP_RESEND: 'Verification code has been sent to your phone number.',
    OTP_FAILED_RESEND: 'Failed to send Verification Code to your phone number. Please try again later.',
    GENERATING_OTP: 'Generating Verification Code...',
    FAILED_TO_REGISTER: 'Registration failed for some unknown reason. Please try again later.',
    SAVING_INFO_LOADER_TEXT: 'Saving info, Please wait...',
    SUCCESS_REGISTER: 'Thank You for Registering!',
    SYSTEM_ERROR: 'System got failure for some unknown reason. Please try again later.',
    CHECKING_INFO_LOADER_TEXT: 'Checking info, Please wait...',
    PLS_WAIT_TEXT: 'Please wait...',
    VERIFICATION_FORGOT_PASSWORD: 'Verification code has been sent to your registered phone number. Please verify your account.',
    PASSWORD_RESET_SUCCESS: 'Your password has been updated successfully.',
    FETCHING_RECORDS: 'Fetching Data...',    
    RECORD_DELETED: 'Record has been deleted successfully.',
    DEALERSHIP_ADDED: 'Dealership has been added successfully.',
    DEALERSHIP_UPDATED: 'Dealership has been updated successfully.',
    DELETING_RECORD: 'Deleting Record...',//new
    CONTACT_ADDED: 'Legal contact has been added successfully.',
    NO_RECORDS_FOUND: 'No Records Found.',
    CONTACT_REQUEST_SEND: 'Thanks! Email has been sent successfully and our support team will contact you soon.',
    PROFILE_UPDATE: 'Profile has been updated successfully.',
    ATLEAST_ONE_DEALERSHIP: 'Please add atleast one dealership.',
    ATLEAST_ONE_CONTACT: 'Please make atleast one legal contact as a primary contact.',
    SELECT_PRIMARY: 'Please select primary contact.',
    MAXIMUM_PRIMARY_CONTACT: 'Primary contact can not be more than one.',
    CAR_STATUS_CHANGED: 'Status has been changed successfully.',
    BID_SUCCESS:'The bid has been applied successfully.',
    BID_UPDATED:'The proxy bid has been updated successfully.',
    BID_ACCEPTED:'The bid has been accepted. The car has been moved to transaction tab.',
    BID_REJECTED:'The bid has been rejected successfully!',
    PAYMENT_FAILED:'Sorry, the transaction has failed due to unknown reason. Please try again in some time.',
    PAYMENT_SUCCESS:'Please wait.. we are generating your order summary.',
    REASON_REQUIRED:"The reason can't be empty.",
    REJECTION_REASON_LENGTH:"The reason shouldn't less than 20 characters.",
    CANCEL_REASON_LENGTH:"The reason shouldn't less than 20 characters.",
    RECORD_PUSHED:"This contact has been recorded. You may now Save it by using Save & Close button or 'Add another' before saving them.",
    RECORD_PUSHED_UPDATED:"Contact has been updated. You may now Save it by using Save & Close button or 'Add another' before saving them.",
    VIN_ALREADY_EXIST:'VIN already exist. Please try again with another VIN.',
    LICENSEPLATE_ALREADY_EXIST:'License Plate number already exist. Please try again with another License Plate number.',
    DEALERSHIP_STATUS:'The dealership status has been changed successfully.',
    SEARCH_SAVED:'The search has been saved successfully.',
    SEARCH_REMOVED:'The saved search has been removed successfully.',
    REPORT_SPAM_SUCCESS:'Car has been reported as spam successfully.', 
    MFA_APPLIED:'The multifactor authentication has been applied successfully.',
    CAR_MOVETO_WISHLIST:'Your car has been moved to wish list.',
    CAR_REMOVED_FROM_WISHLIST:'Your car has been removed from wish list.',
    CAR_HIDDEN:'Your car has been hidden.',  
    CAR_UN_HIDEEN:'Your car has been unhidden.',
    ADD_PAYMENT_METHOD:'Adding your payment details.. please wait.',
    DISPUTE_SAVED:'The dispute has submitted successfully.',
    DISPUTE_MESSAGE_SUCCESS:'The message has been sent successfully.',
    BID_PRICE_LESS:'Please enter the minimum price',
    DEALERSHIP_ACIVATED:'Please activate at least one dealership.',
    MESSAGE_EMPTY:'Please enter the message.',
    BID_CANCEL:'The bid has been cancelled successfully.',
    DESCRIPTION_REQUIRED:'description is required.'
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

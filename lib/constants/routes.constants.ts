export const ROUTES = {
   LANDING_PAGE: '/',

   SIGN_IN: {
    ROOT: '/signin',
    ROLE_SELECTION: '/signin/role-selection',
    ADMIN: '/sigin/admin',
   },

   SIGNUP: {
    ROOT: '/signup',
    ROLE_SELECTION: '/signup/role-selection',
    OTP_VERIFICATION: '/signup/otp-verification',
   },

   ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    USER_DETAILS: '/admin/user/[id]',
   },

   CLIENT: {
      ROOT: '/client',
   },

   FREELANCER: {
      ROOT: '/freelancer',
   },

   FORGOT_PASSWORD: {
      ROOT: '/forgot-password',
      RESET: '/forgot-password/reset',
      VERIFICATION: '/forgot-password/verification',
   },

   UNAUTHORIZED: '/unauthorized',
}
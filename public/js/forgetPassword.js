import axios from 'axios';
import { showAlert } from './alerts';

export const forgetPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/forgotPassword',
      data: { email },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `A Link to a new password has sent to the given email : ${email}`,
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// import axios from 'axios';
// import { showAlert } from './alerts';

// export const forgetPassword = async (email) => {
//   try {
//     const baseURL = window.location.origin; // http://127.0.0.1:3000 ή https://yourapp.com
//     const res = await axios({
//       method: 'POST',
//       url: `${baseURL}/api/v1/users/forgotPassword`,
//       data: { email },
//     });

//     if (res.data.status === 'success') {
//       showAlert('success', `A link to reset your password has been sent to ${email}`);
//     }
//   } catch (err) {
//     showAlert('error', err.response?.data?.message || 'Error sending reset link');
//   }
// };

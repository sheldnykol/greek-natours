import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 2500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// //
// /* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';

// // type is either 'password' or 'data'

// export const updateSettings = async (data, type) => {
//   try {
//     if (type === 'password') {
//       const url = 'http://127.0.0.1:3000/api/v1/users/updateMyPassword';

//       const res = await fetch(url, {
//         method: 'PATCH',
//         body: data,
//       });
//       const result = await res.json();
//       if (result.status === 'success') {
//         showAlert('success', `${type.toUpperCase()} updated successfully!`);
//       } else {
//         throw new Error(result.message || 'Failed to update data');
//       }
//     }
//   } catch (err) {
//     console.log('Fetch error:', err);
//     showAlert('error', 'Error updating data: ' + err.message);
//   }
// };

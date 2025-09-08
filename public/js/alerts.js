// export const hideAlert = () => {
//   const el = document.querySelector('.alert');
//   if (el) el.parentElement.removeChild(el);
// };

// // type is 'success' or 'error'
// export const showAlert = (type, msg) => {
//   hideAlert();
//   if (message.includes('not logged in') || message.includes('Invalid token')) {
//     window.setTimeout(() => {
//       location.assign('/login');
//     }, 1500);
//   } else {
//     const markup = `<div class="alert alert--${type}">${msg}</div>`;
//     document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
//     window.setTimeout(hideAlert, 5000);
//   }
// };
/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type, msg) => {
  console.log('showAlert called:', type, msg); // Log για debugging
  hideAlert();
  if (msg.includes('not logged in') || msg.includes('Invalid token')) {
    window.setTimeout(() => {
      location.assign('/login');
    }, 1500);
  } else {
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
  }
};

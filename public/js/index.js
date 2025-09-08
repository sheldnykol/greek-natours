import '@babel/polyfill';
import axios from 'axios';
import { displayMap } from './mapbox';
import { login, logout, signUp } from './login';
import { updateSettings } from './updateSettings';
import { forgetPassword } from './forgetPassword';
import { showAlert } from './alerts';
import { bookTour } from './stripe';
import { ratingJS, updateRating } from './rating';

// document.querySelector('.nav__toggle-btn').addEventListener('click', () => {
//   document
//     .querySelectorAll('.nav')
//     .forEach((nav) => nav.classList.toggle('nav--open'));
// });
const toggleBtn = document.querySelector('.nav__toggle-btn');
const overlay = document.querySelector('.header__overlay');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    console.log('Toggle clicked');
    document.querySelectorAll('.nav').forEach((nav) => {
      nav.classList.toggle('nav--open');
      console.log('Toggling nav:', nav);
    });
    overlay.classList.toggle('nav--open');
  });
}

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const forgotPasswordForm = document.querySelector('.form--forgot-password');
const resetPassword = document.querySelector('.form--reset-password');
const signUpForm = document.querySelector('.form--signup');
const dateForm = document.querySelector('.date-form');
const sidebarLinks = document.querySelectorAll('.side-nav a');
const calendarEl = document.getElementById('calendar');
const ratingForm = document.querySelectorAll('.rating-form');
//const editRating = document.querySelectorAll('.edit-review-form');

// if (dateform) {
//   console.log('exists');
//   const select = dateform.querySelector('select[name="startDate"]');
//   //console.log('SELECT', select);
//   select.addEventListener('change', () => {
//     const tourId = dateform.querySelector('#tour')?.value;
//     //const userId = dateform.querySelector('#user')?.value;
//     const startDate = select.value;
//     console.log(
//       `Selected Date : ${startDate} for tour: ${tourId} and user : ${userId}`,
//     );
//     dateform.addEventListener('submit', () => {
//       e.target.textContent = 'Proccessing...';
//       if (startDate && tourId) {
//         bookTour(tourId, startDate);
//       } else {
//         showAlert('error', 'Something went wrong with the values');
//       }
//     });
//     //
//   });
// }
if (dateForm) {
  console.log('dateForm exists');
  const select = dateForm.querySelector('select[name="startDate"]');
  const tourInput = dateForm.querySelector('#tour');
  const userInput = dateForm.querySelector('#user');

  select.addEventListener('change', () => {
    const startDate = select.value;
    const tourId = tourInput?.value;
    const userId = userInput?.value;
    console.log(
      `Selected Date: ${startDate} for tour: ${tourId} and user: ${userId}`,
    );
  });

  dateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const startDate = select.value;
    const tourId = tourInput?.value;
    const userId = userInput?.value;
    if (!startDate || !tourId || !userId) {
      showAlert(
        'error',
        'Please select a start date and ensure tour and user IDs are provided',
      );
      return;
    }
    //ορισμος startDate apo string σε date object για συγκριση
    const currentDate = new Date();
    const selectedDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    console.log('current date and selected date ', currentDate, selectedDate);
    if (selectedDate <= currentDate) {
      showAlert('error', 'I am sorry this date is expired !');
      return;
    } else {
      document.querySelector('#bookBtn').textContent = 'Processing...';
      console.log('Submitting booking:', { startDate, tourId, userId });
      await bookTour(tourId, startDate);
      document.querySelector('#bookBtn').textContent = 'Book Now';
    }
  });
}
//   bookBtn.addEventListener('click', (e) => {
//     e.target.textContent = 'Proccessing...'; //alazoyme to text se auto to button
//     //const tourId = e.target.data.tourId; //pernei auto poy ekane to event listener na doul4ei poy paththke(to button add book )
//     const { tourId } = e.target.dataset; //efosn exoun idio onoma ta tour id mporei na ginei destructurin structurin
//     console.log(tourId);
//     bookTour(tourId);
//   });

document.addEventListener('DOMContentLoaded', () => {
  const editRating = document.querySelectorAll('.edit-review-form');
  console.log('EditRating forms found:', editRating.length, editRating); // Debug: Δείχνει πόσα forms βρέθηκαν

  if (editRating.length > 0) {
    editRating.forEach((form, index) => {
      const inputs = form.querySelectorAll('.rating__input'); // Διορθώθηκε το selector
      console.log(`Form ${index} found ${inputs.length} rating inputs`, inputs);
      inputs.forEach((input, inputindex) => {
        input.addEventListener('change', () => {
          const tourInput = form.querySelector('input[name="tour"]');
          const userInput = form.querySelector('input[name="user"]');
          const tourId = tourInput?.value;
          const userId = userInput?.value;
          console.log(
            `Form ${index} - Selected Star : ${input.value}, tourInput:`,
            tourInput,
            `userInput`,
            userInput,
          );
        });
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const action =
          e.submitter.getAttribute('name') === 'action'
            ? e.submitter.value
            : null;
        console.log(action);
        const rating = form.querySelector(
          'input[name="rating"]:checked',
        )?.value;
        if (action === 'save') {
          const review = form.querySelector('textarea[name="review"]')?.value;
          const tourInput = form.querySelector('input[name="tour"]');
          const userInput = form.querySelector('input[name="user"]');
          const reviewInput = form.querySelector('input[name="review"]');
          const reviewId = reviewInput?.value;
          const tourId = tourInput?.value;
          const userId = userInput?.value;
          console.log(`Form ${index + 1} - Submitting review:`, {
            rating,
            review,
            tourId,
            userId,
            reviewId,
          });
          updateRating(reviewId, rating, review);
        }

        if (action === 'delete') {
          console.log('right place');
          const reviewId = e.submitter.dataset.reviewId;
          // const button = e.target.closest('.btn--delete-review'); // Ελέγχει μόνο για .btn--delete-review
          // if (button) {
          //   const reviewId = button.dataset.reviewId;
          console.log('button checked, REVIEWID:', reviewId);
          if (confirm('Are you sure you want to delete this review?')) {
            try {
              await axios({
                method: 'DELETE',
                url: `/api/v1/reviews/${reviewId}`,
              });
              showAlert('success', 'Review deleted successfully');
              setTimeout(() => location.reload(), 1500);
            } catch (err) {
              console.error('Delete error:', err);
              showAlert(
                'error',
                err.response?.data?.message || 'Failed to delete review',
              );
            }
          }
        }
      });

      // Αν το κλικ γίνει σε άλλο κουμπί (π.χ. .btn--blue), δεν θα μπει στο if
    });
  } else {
    console.log('No .edit-review-form elements found in the DOM');
  }
});

if (ratingForm.length > 0) {
  console.log('Found rating forms:', ratingForm.length);
  ratingForm.forEach((form, index) => {
    console.log(`Processing form ${index + 1}:`, form);
    const inputs = form.querySelectorAll('.rating__input');
    console.log(`Form ${index + 1} - Found ${inputs.length} radio inputs`);
    inputs.forEach((input, inputIndex) => {
      input.addEventListener('change', () => {
        const tourInput = form.querySelector('input[name="tour"]');
        const userInput = form.querySelector('input[name="user"]');
        const tourId = tourInput?.value;
        const userId = userInput?.value;
        console.log(
          `Form ${index + 1} - Selected star: ${input.value}, tourInput:`,
          tourInput,
          `userInput:`,
          userInput,
        );
        console.log(
          `Form ${index + 1} - Selected star: ${input.value} for tour: ${tourId} for user: ${userId}`,
        );
      });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = form.querySelector('input[name="rating"]:checked')?.value;
      const review = form.querySelector('textarea[name="review"]')?.value;
      const tourInput = form.querySelector('input[name="tour"]');
      const userInput = form.querySelector('input[name="user"]');
      const tourId = tourInput?.value;
      const userId = userInput?.value;
      console.log(`Form ${index + 1} - Submitting review:`, {
        rating,
        review,
        tourId,
        userId,
      });
      console.log(`Form ${index + 1} - Inputs:`, { tourInput, userInput });
      if (!rating) {
        showAlert('error', 'Please select a rating');
        return;
      }
      if (!tourId || !userId) {
        showAlert('error', 'Tour ID or User ID missing');
        return;
      }
      await ratingJS(rating, review, tourId, userId);
    });
  });
} else {
  console.log('No rating forms found');
}
// if (ratingForm) {
//   ratingForm.forEach((form) => {
//     const inputs = form.querySelectorAll('.rating__input');
//     inputs.forEach((input) => {
//       input.addEventListener('change', () => {
//         const tourId = form.querySelector(`#tour-${tour.id}`)?.value; // Fixed: use the correct ID format
//         const userId = form.querySelector(`#user-${tour.id}`)?.value;
//         console.log(
//           `Selected star: ${input.value} for tour: ${tourId} for user: ${userId}`,
//         );
//       });
//     });
//     form.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const rating = form.querySelector('input[name="rating"]:checked')?.value;
//       const review = form.querySelector('.form__input[name="review"]')?.value;
//       const tourId = form.querySelector('input[name="tour"]')?.value;
//       const userId = form.querySelector('input[name="user"]')?.value;
//       if (!rating) {
//         showAlert('error', 'Please select a rating');
//         return;
//       }
//       console.log('Submitting review:', { rating, review, tourId, userId });
//       await ratingJS(rating, review, tourId, userId);
//     });
//   });
// }
// const tourId = form.querySelector('#tour')?.value;
// const userId = form.querySelector('#user')?.value;
if (userDataForm) {
  console.log('userDataForm found:', userDataForm);
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submitted at', new Date().toLocaleTimeString());
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
      form.append('photo', photoFile);
      console.log('Photo selected:', photoFile.name);
    } else {
      console.log('No photo selected');
    }
    console.log('Form data:');
    for (let [key, value] of form.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }
    updateSettings(form, 'data');
  });
}

if (calendarEl) {
  // Get tour data from a hidden element
  const tourDataElement = document.getElementById('tour-data');
  const tour = tourDataElement ? JSON.parse(tourDataElement.textContent) : {};

  // Debug: Log tour data to confirm it's loaded
  console.log('Tour data:', tour);
  console.log('Tour startDates:', tour.startDates);
  console.log('Tour duration:', tour.duration);

  // Generate events and log immediately
  const events =
    tour.startDates && tour.duration
      ? tour.startDates.map((startDate, index) => {
          const start = new Date(startDate);
          console.log('start date for event', start);
          const end = new Date(start);
          console.log('end date before setDate', end);
          end.setDate(start.getDate() + tour.duration); // Add 9 days
          console.log('end date after setDate', end);
          return {
            title: `${tour.name || 'Athens Urban Explorer'} (Tour ${index + 1})`,
            start: start,
            end: end,
            allDay: true,
            backgroundColor: '#3586dcff', // Blue background
            borderColor: '#3586dcff', // Blue border
            textColor: 'white', // White text
          };
        })
      : [];
  console.log('Generated events:', events);

  // Initialize FullCalendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: events,
  });
  calendar.render();
}

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('passwordConfirm').value;

    console.log('name', name);
    if (password !== confirmPassword) {
      showAlert('error', 'Passwords do not match');
      return;
    }

    // Password validation: at least 8 characters and one uppercase letter
    const passwordRegex = /^(?=.*[A-Z]).{8,50}$/;
    if (!passwordRegex.test(password)) {
      showAlert(
        'error',
        'Password must contain at least 8 characters and one uppercase letter',
      );
      return;
    }

    signUp(name, email, password, confirmPassword);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (forgotPasswordForm) {
  console.log('forgetPassword Form : ', forgotPasswordForm);
  forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgetPassword(email);
  });
}

if (resetPassword) {
  resetPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const token = window.location.pathname.split('/').pop();

    try {
      const baseURL = window.location.origin;
      const res = await fetch(
        `${baseURL}/api/v1/users/resetPassword/${token}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, passwordConfirm }),
        },
      );

      const data = await res.json(); // Parse the response
      console.log('data', data); // Debug: Log the parsed data
      console.log('data.status', data.status); // Debug: Log the status

      if (data.status === 'success') {
        showAlert('success', 'Password Changed Successfully');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      } else {
        showAlert('error', data.message || 'Error resetting password');
      }
    } catch (err) {
      console.error('Error:', err); // Debug: Log the error
      showAlert('error', 'Could not connect to server');
    }
  });
}
if (logOutBtn) logOutBtn.addEventListener('click', logout);

//acount options

// if (sidebarLinks) {
//   console.log('side bar links html ', sidebarLinks);
//   sidebarLinks.forEach((link) => {
//     link.addEventListener('click', async (e) => {
//       e.preventDefault();
//       const view = link.id;
//       console.log('view: ', view);
//       // Remove active class from all links
//       sidebarLinks.forEach((l) =>
//         l.parentElement.classList.remove('side-nav--active'),
//       );
//       // Add active class to clicked link
//       link.parentElement.classList.add('side-nav--active');

//       // Redirect to the appropriate view
//       const baseURL = window.location.origin;
//       const res = await fetch(`${baseURL}/`, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//       });
//       console.log('response data : ', res.data);
//       if (res.data.view === 'my-bookings') {
//         window.location.assign('/my-tours');
//       } else {
//         // For other views, redirect to /account (default view: settings)
//         window.location.assign('/me');
//       }
//     });
//   });
// }
if (sidebarLinks) {
  console.log('Sidebar links found:', sidebarLinks);
  sidebarLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view; // Χρησιμοποιούμε data-view αντί για id
      console.log('Selected view:', view);

      // Remove active class from all links
      sidebarLinks.forEach((l) =>
        l.parentElement.classList.remove('side-nav--active'),
      );
      // Add active class to clicked link
      link.parentElement.classList.add('side-nav--active');

      // Redirect to the appropriate view
      if (view === 'my-bookings') {
        window.location.assign('/my-tours');
      } else if (view === 'my-reviews') {
        window.location.assign('/my-reviews');
        // For other views, redirect to /account (default view: settings)
      } else {
        window.location.assign('/me');
      }
    });
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// if (bookBtn)
//   bookBtn.addEventListener('click', (e) => {
//     e.target.textContent = 'Proccessing...'; //alazoyme to text se auto to button
//     //const tourId = e.target.data.tourId; //pernei auto poy ekane to event listener na doul4ei poy paththke(to button add book )
//     const { tourId } = e.target.dataset; //efosn exoun idio onoma ta tour id mporei na ginei destructurin structurin
//     console.log(tourId);
//     bookTour(tourId);
//   });

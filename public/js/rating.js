import axios from 'axios';
import { showAlert } from './alerts';

export const ratingJS = async (rating, review, tour, user) => {
  try {
    console.log('DATA TO API ', { rating, review, tour, user });
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/reviews',
      data: {
        review,
        rating,
        tour,
        user,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Your rating have been submited , Thanks for making A review !',
      );
      window.setTimeout(() => {
        location.assign('/my-tours');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateRating = async (reviewId, rating, review) => {
  try {
    console.log('DATA TO API ', { reviewId, rating, review });
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/reviews/${reviewId}`,
      data: {
        rating,
        review,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Your rating has changed , Thanks for making a review ',
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

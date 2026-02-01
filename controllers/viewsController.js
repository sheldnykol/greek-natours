const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
//const { bookTour } = require('../public/js/stripe');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
 
  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

// exports.updateUserData = catchAsync(async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     },
//   );

//   res.status(200).render('account', {
//     title: 'Your account',
//     user: updatedUser,
//   });
// });

exports.getForgetPassword = (req, res) => {
  res.status(200).render('forgetPassword', {
    title: 'Forgot your password ',
    error: null,
    success: null,
  });
};
exports.resetPassword = (req, res) => {
  res.status(200).render('resetPassword.pug', {
    title: 'Reset Password',
    error: null,
    success: null,
  });
};
exports.signUp = (req, res) => {
  res.status(200).render('signup.pug', {
    title: 'Sign Up',
    error: null,
    success: null,
  });
};
exports.getMyTours = catchAsync(async (req, res, next) => {
  // Find all bookings for the user
  const bookings = await Booking.find({ user: req.user.id });

  // Create an array of tour IDs
  const tourIDs = bookings.map((el) => el.tour.id);

  // Fetch tours with the returned IDs
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // Combine tour data with startDate from bookings
  const toursWithStartDate = bookings.map((booking) => {
    const tour = tours.find((t) => t._id.toString() === booking.tour.id);
    return {
      ...tour.toObject(), // Convert Mongoose document to plain object
      startDate: booking.startDate, // Add startDate from booking
    };
  });

  //console.log('Tours with startDate:', toursWithStartDate);

  res.status(200).render('account', {
    title: 'My Bookings',
    user: req.user,
    tours: toursWithStartDate,
    view: 'my-bookings',
  });
});
//  without combining tour id with startDate !
// exports.getMyTours = catchAsync(async (req, res, next) => {
//   //find all bookings
//   const bookings = await Booking.find({ user: req.user.id });
//   //find tours with the returned IDs
//   const tourIDs = bookings.map((el) => el.tour.id); //kanei ena array opoy krataei ola ta id apo ta tours
//   const tours = await Tour.find({ _id: { $in: tourIDs } }); //select ola ta tours poy exoyn id k einai mesa sto tourIDS

//   console.log(tours);
//   res.status(200).render('account', {
//     title: 'My Bookings',
//     user: req.user,
//     tours,
//     view: 'my-bookings',

//   });
// });

exports.PatchReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate('tour');
  // 1. Βρίσκεις όλα τα ratings/reviews για τον χρήστh
  //console.log('all review from a user ', reviews);
  // 2. Κανω map για να εξαγω το tour id , review text , rating
  const mappedReviews = reviews.map((review) => ({
    reviewText: review.review,
    rating: review.rating,
    reviewId: review._id.toString(), //TO THELW GIA META GIA na kanw epexergasia
    tour: {
      id: review.tour._id.toString(),
      name: review.tour.name,
      imageCover: review.tour.imageCover,
      slug: review.tour.slug,
    },
  }));
  //.log('mappedReviews', mappedReviews);

  res.status(200).render('account', {
    title: 'My Reviews',
    user: req.user,
    reviews: mappedReviews,
    view: 'my-reviews',
  });
});

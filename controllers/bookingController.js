const stripe = require('stripe')(
  'sk_test_51S0jvlB2bpLGEFECoxhqKMbKaiPPqyxVufJj5HzCOHKWeGKlGqpCzaeJlbYFv7rEWBhxB8DqXnq8DsRv3HSqkBFg00EJL3RSXj',
);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Booking = require('./../models/bookingModel');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  const startDate = req.query.startDate;
  console.log('THE DATE IS THIS', startDate);
  if (!tour && !startDate) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // 2) Create checkout session
  console.log('tour id ', tour.id);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}&startDate=${startDate}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: tour.price * 100, // Amount in cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              'https://images.unsplash.com/photo-1503458321810-9a8a79b7c5bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment', // Required for one-time payments
  });

  // 3) Send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price, startDate } = req.query;

  if (!tour && !user && !price && !startDate) return next();
  await Booking.create({ tour, user, price, startDate });
  res.redirect(req.originalUrl.split('?')[0]); //${req.protocol}://${req.get('host')}
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

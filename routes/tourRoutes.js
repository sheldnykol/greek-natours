const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is : ${val} `);
// });
//router.param('id', tourController.checkID);
//tha to perasoume apo middlewere opoy tha kanoyme manipulation to getAllTours request
//gi na to prosarmosoume etsi wste na na mas emfanizei ta 5 poio fthna tours
//ΑΡΑ ΕΧΟΥΜΕ ΤΟ AliasTopTours οπου κανει τροποποιηση το query και μετα περναει στο
//getAllTours οπου μας εκτελει το query!
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter); //otan breis url san auto
//to reviewrouter prepei na exie prosbash sto tour id ara paw sto review router
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//as poyme oti meneis los angeles kai thes se apostash 300 milia na deis poia tour yparxyon

// /tours-distance?distance=233&center=-40, 45&unit=mi
// /tours-distance/233/center/-40,45/unit/mi // poio clean aut o tha kanoyme
//tha xreiastoume tour handler

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances); //tha upologisoyme apo ena sygkerimeno shmeio tis apostaseis apo ola ta tour
router
  .route('/')
  .get(tourController.getAllTours)
  //an den ginei authiticate o user den pernaei sto tour controller (prostateuei gia thn sundesh)
  //prwta tha trexei  to prwto meros an einai okay auto tha trexei to allo
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'), //afhnei mono autous tous rolous na diagra4oyn ena tour
    tourController.deleteTour,
  );
//change type of secret tour if you are admin

router
  .route('/updateSecretTour/:tourId')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.updateSecretTour,
  );

module.exports = router;

// app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter)  stp api.js

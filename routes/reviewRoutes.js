const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });
//tourid apo tour (mergeparams gia na exoume prosbash se tourRoutes sto /:tourId/reviews  )

router.use(authController.protect); //oloi prepei na exoun sundethei
router
  .route('/') //se auto to url den yparxei tourId alla theloyme access sto allo router
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setToursUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
module.exports = router;

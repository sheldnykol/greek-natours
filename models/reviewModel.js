//review text
//rating
//createdAt
//ref to tour
//ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Cant be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      //POPULATE
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }, //otan exoyme ena pedio poy den exei ineis stored sthn database na emfanizete kathe for sto output
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour', // POPULATE
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next(); //populate all the documents that starts with find
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        //kanoyme ena group based sta tour
        _id: '$tour',
        nRating: { $sum: 1 },

        avgRating: { $avg: '$rating' }, //to avg apo to field rating //epishs epistrefei promise ara bazw  await
      },
    },
  ]);
  //console.log(stats); //this einai to model kai kaloyme to aggregate panta sto model
  const Tour = mongoose.model('Tour');
  if (stats.length > 0) {
    //elegxoyme edw !!! alliws error
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    //se periptwsh poy exoyn diagrafei ola ta reviews exoyme to parakatw default giati alliws exoyme eeror
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // otan tha kanei post ola ta document exoun hdh ginei save sto database
  //this points to current review
  this.constructor.calcAverageRatings(this.tour); //einai to model to constructor
});
// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.clone().findOne(); // Χρησιμοποιούμε clone() για να αποφύγουμε το σφάλμα
  //console.log(this.review); //PRIN ALLAXEI TO RATING PRIN GINE IUPDATE EMFANIZEI TO PALIO RATING
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // Χρησιμοποιούμε clone() για να αποφύγουμε το σφάλμα
  this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
//  POST /tour/2343543/reviews access reviews to tour
//DUPLICATE REVIEWS SAME USER ID SAME TOUR
//KATHE USER MPOREI NA GRA4EI 1 REVIEW GIA ENA TOUR

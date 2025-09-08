const { Query } = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//console.log('AppError loaded:', AppError);
const multerStorage = multer.memoryStorage(); //save sthn mnhmh oxi sto storage (buufer)

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]); //perimenei 1 image cover kai 3 images !

//upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //console.log('files', req.files);
  //imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  //console.log('imageCover:', req.body.imageCover);
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`); //TO BAZW ETSI EXEI NA KANEI ME TO UPDATE DESFACTORY UPDATE ONE
  //Images
  req.body.images = [];

  // Χρησιμοποιούμε map για να δημιουργήσουμε array από promises
  const imagePromises = req.files.images.map(async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

    // Επεξεργασία της τρέχουσας εικόνας (file.buffer αντί για imageCover)
    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`); // Σωστή διαδρομή

    return filename; // Επιστρέφουμε το filename για το req.body.images
  });

  // Περιμένουμε όλες τις εικόνες να επεξεργαστούν
  req.body.images = await Promise.all(imagePromises);
  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
//GET ALL ()
exports.getAllTours = factory.getAll(Tour);
//  catchAsync(async (req, res, next) => {
// //   const features = new APIFeatures(Tour.find(), req.query)
// //     .filter()
// //     .sort()
// //     .limitFields()
// //     .paginate();
// //   const tours = await features.query;
// //   //SEND RESPONSE
// //   res.status(200).json({
// //     status: 'success',
// //     results: tours.length,
// //     data: {
// //       tours,
// //     },
// //   });
// // });

//GET (ID)
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   //console.log('tour : ', req.params.id);
//   //const tour = await Tour.findById(req.params.id).populate('guides');
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   //Tour.findOne({ _id: req.params.id })
//   //console.log('tour : ', tour);
//   if (!tour) {
//     // console.log('GOes into Apperror ?');
//     return next(new AppError('No tour Found with that ID', 404));
//     //to kanw return giati afou den yparxei ena tour me auto to id
//     //den thelw na bgalei to apo katw 200 success na paei sto next !code line
//     //thelw na kanei return kai na sunecizei apo ekei (den eimai sigouros an einai etsi akribws)
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

//UPDATE (ID)
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour Found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
//updateTour
exports.updateTour = factory.updateOne(Tour);

//CREATE ()
// exports.createTour = catchAsync(async (req, res, next) => {
//   // console.log(req.body);
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
//Create Tour
exports.createTour = factory.createOne(Tour);
//delete Tour
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour Found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
//Delete Tour
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 }, //πορσθετουμε 1 για καθε εγγραφο ! θα περασει απο καθε τουρ
        numRatings: { $sum: 'ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(201).json({
    status: 'success',
    data: {
      tour: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //xwrise ta tours ana startDate ara 9 poy htan ta tour * 7 27 sto sunolo
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`), //kane match wste ta starDates na einai πχ στο 2021 ΜΟΝο
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //o mhnas kathefora  tou etous poy dothke
        numTourStarts: { $sum: 1 }, //prosthetei kathe fora poy peernaei apo ena tour
        tours: { $push: '$name' }, //emfanizei poia tours
      },
    },
    {
      $addFields: { month: '$_id' }, //prosthetei ena pedio me ton mhna
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 }, //kanei sort epeidh exei - kanei fthinousa taxinomhsh
    }, // me bash to numTourStarts  ! ara opoios mhnas exei ta perissotera tour ton epilegmeno xrono tha
    //emfanistei prwtos !
    {
      $limit: 6,
    },
  ]);
  //SUMMARY ara ti exoyme
  //Xekiname kanoyme Match to startDates opoy to etos poy tha mpei sto url tha einai to epilegmeno
  //kai tha emfanisoyme data mono gia ton xrono auton !
  //meta kanoyme group dhladh ti tha emfanistei to id opoy tha deixnei ton mhna ena count gia kathe tour poy pernaei
  //me bash ton mhna kai emfanish ta tours !
  //prosthetoume ena pedio toy mhna kai kanoyme to id aorato project _id: 0 kai sthn synxeia
  //kanoyme sort to numTourStarts kai kanei limit ews 6 mhnes !
  res.status(201).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.updateSecretTour = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const { secretTour } = req.body;
  if (typeof secretTour != 'boolean') {
    return next(new AppError('secretTour must be a boolean value ', 400));
  }
  const tour = await Tour.findById(tourId).setOptions({
    allowSecretTours: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  tour.secretTour = secretTour;
  await tour.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});
/////////////////////////////////////////////////////////////////////////////////////
///OLD CODE
// BUILD QUERY

// // 1) Filtering
// const queryObj = { ...req.query }; // query parameters από το URL { duration: '5', sort: 'price' }

// console.log('query parameters απο URL ', queryObj);

// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// //afairoume ta excluedfields apo to queryObj
// excludedFields.forEach((el) => delete queryObj[el]);

// //afairoume ta excluedfields apo to queryObj

// // 2) Advanced Filtering
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
// console.log('Query  after replace : ', JSON.parse(queryStr));
// let query = Tour.find(JSON.parse(queryStr));

// 3) Sorting
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   console.log(sortBy);
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }
// 3) field limiting (Me liga logia emfanizei mono osa dialexoyme emeis sto field)
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

//pagination

// const page = req.query.page * 1 || 1; //Αν δεν δώσει τίποτα, default είναι page = 1, limit = 100.
// //default 1
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// console.log(skip); //posa tours exeis perasei px sthn deuyter
// // page=1&limit=3 skip = 0 , page=2&limit=3 skip = 3
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error('This page does not exist');
// }

// 5 best tours
// {difficulty : 'easy' , duratiom }

// SEND RESPONSE

// const query = await Tour.find(JSON.parse(queryStr));

//  {
//   // duration: 5,
//   // difficulty: 'easy',
// }); αντι να εχω αυτο μεσα στο find αφαιρω αυτα που δεν θελω ! και εειναι σαν αυτο εδω που εχω
//EXECUTE QUERY
// const tours = await query;
//console.log('Tour.find() :   ', await Tour.find({ difficulty: 'easy' }));
//console.log('req query', req.query);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //radius of earth in miles
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the formal !',
        400,
      ),
    );
  }
  //console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //radius of earth in miles
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the formal !',
        400,
      ),
    );
  }
  //console.log(lat, lng, unit);
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], // * 1 gia na einai numbers
        },
        distanceField: 'distance',
        // distanceMultiplier: 0.001, xiliometra
        distanceMultiplier: multiplier, //milia
      },
    },
    {
      $project: {
        //ta fields poy theloyme na deixei mono !
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',

    data: {
      data: distances, //apotelesma se metra dierw me 1000 h * 0.0001  gia na dw se xiliometra
    },
  });
});

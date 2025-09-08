const User = require('./../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
// const AppError = require('./../utils/appError');
// console.log('AppError loaded:', AppError);

//upload image
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     //cb cllback function is like next is express
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-745747547545547nbff-343434344434.jpeg //onoms file timestsmp ksi typos arxeioy

//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
//upload pictures
const multerStorage = multer.memoryStorage();

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
// const multerStorage = multer.memoryStorage(); //ara sto buffer !

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     //tsekarei an einai image
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image ! Please upload only images. !', 400), false);
//   }
// };

// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// exports.uploaduserPhoto = upload.single('photo');

// exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
//   if (!req.file) return next();
//   //npm install sharp
//   //genika na apothekeuseis sthn mnhmh oxi sotn disko !! gt tha prepei na to kan wresize
//   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/users/${req.file.filename}`); //sto buffer apothkeuasame photo kai edw thn diabazoume
//   // reisize w h theloyme tetragwno ara 500x500
//   next();
// });
//end upload image middlewere
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  }); //epistrecei ola ta fields kanei loop ena object easy
  return newObj;
};
exports.getAllUser = factory.getAll(User);
// exports.getAllUser = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   //stelnw response
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

//upate name
// exports.updateMe = catchAsync(async (req, res, next) => {
//   // 1) create error if user POST password data
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(
//       new AppError(
//         'This route is not for password updates.Please use /updateMypassword',
//         400
//       )
//     );
//   }
//   //2) update user document
//   const filteredBody = filterObj(req.body, 'name', 'email');
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(200).json({
//     status: 'success',
//     data: {
//       user: updatedUser,
//     },
//   });
// });

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!Use signup ',
  });
};
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('file :', req.file);
  console.log('body : ', req.body);
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteUser = factory.deleteOne(User);
//Do not update passwords
exports.updateUser = factory.updateOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

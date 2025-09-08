const express = require('express');

const userController = require('./../controllers/userController');
const router = express.Router();
const authController = require('./../controllers/authController');
const reviewController = require('./../');

//HANDLERS
// router.get('/users', userController.getAllUser);
router.post('/signup', authController.signup);
router.post('/login', authController.login); //stelnw ta login ta login data !gia auto einai post
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword); //stelnw ta login ta login data !gia auto einai post
router.patch('/resetPassword/:token', authController.resetPassword);

//protect ALL THE NEXT ROUTES
router.use(authController.protect); //tha kanei protect ola ta routes poy briskontai apo katw
//afou paeei next next next !
router.patch(
  '/updateMe',
  userController.uploadUserPhoto, // Διορθώθηκε από uploaduserPhoto
  userController.resizeUserPhoto,
  userController.updateMe,
); //pernei to arxeio kai to kanei copy sto dest file poy orisame sto const multer

router.patch('/updateMyPassword', authController.updatePassword);
// router.patch('/updateMe', authController.protect, userController.updateMe);
router.get(
  '/me',
  // authController.protect,
  userController.getMe,
  userController.getUser,
);
router.delete('/deleteMe', userController.deleteMe);
router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);

// router.use(authController.restrictTo('admin'));
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

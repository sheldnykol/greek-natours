const mongoose = require('mongoose');
const dotenv = require('dotenv');
const util = require('util');
const app = require('./api'); // Assuming you have an Express app in api.js

//den xreiazomaste ton server gia  na to trexoume auto
//dioti auta ta sfalmata den tha sumbon asxyxrona ara den exoun kamia sxesh me ton diakomisth 1
// //uncut exceptions  ola ta \
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down..');
  console.log(
    'olo to err : ',
    util.inspect(err, { showHidden: true, depth: null }),
  );
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

// Replace password placeholder in DB URI
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// Connect to MongoDB
mongoose.connect(DB).then(() => {
  console.log('Connected to MongoDB');
  //catch(err => console.log('ERROR'));
});
// .catch((error) => {
//   console.error('Error connecting to MongoDB:', error);
// });

// Start server
const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
//event event listeners
//
process.on('unhandleRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION! SHUTING DOWN ...');
  server.close(() => {
    process.exit(1);
  });
  //kanoyme exit to programma //0 success // 1 η συλληφθεια εξαιρεση
});

//console.log(x); //am lamoyme console log kati poy den yparxei
//an eixame to console log x tote thumisoy oti !!! tha eprepe
//na trexoume ena erwthma gia na trexei to function ! kai meta
//na paei kanonika ston error controller wste na mas petaxei 500 server error

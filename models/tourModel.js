const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      //validators
      //maxlength , minlength ειναι validators για String Μόνο
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], //mporoyme na to kanoume me array anti gia object
      //htan apla kati gia dokimastiko
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      //validators
      enum: {
        //enum validator : times poy epitrepontai
        values: ['easy', 'medium', 'difficult'], //possible values only for strings
        message: 'Difficulty is either : easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      //validators (! min max douleuei kai se dates)
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.66666 , 46.6666 , 47 , 4.7 //tha trexei kathe fora poy yparei neo value
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current odc on New DOC (post )
          //αυτο το this δειχνει μονο αυτο που παει να δημιουργησει οχι για update
          return val < this.price; // 100(disc p ) < 200 (price)
        },
        message: 'Discount price ({VALUE}) should be below the actual price ',
      },
    }, //tha kanoyme enan custom validator ΟΠΟΥ θα ελένχει
    //αν η τιμη εκτπωσης ειναι μεγαλύτερη απο την τιμή

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //Geo JSON
      //auto to object einai ena enswmetomeno object opoy orisoyme kapoies idiothtes
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], //enum oles oi pithanes times poy mporei na exei
      },
      coordinates: [Number], //lat , lang //suntetagmenes
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      }, //ftiaxxnei odcuments mesa st oparant document
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  } //kathe fora poy ta dedomena ginontai se json tote theloyme virtuals to be true
  //dhladh na emfanziontai sto output
);
//tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //index to a 2d sphere
//tha dhmiourgeite kathe fora poy pernoyme data apo thn database
tourSchema.virtual('durationWeeeks').get(function () {
  return this.duration / 7; //briskeis tis ebdomades an ena tour eixei diarkeia 7 meres tote 1 ebdoamda
});
//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //to onoma apo to field poy exei anafora sto reviewModel
  localField: '_id',
});
//virtual dhladh den tha apothekeuontai sthn bash alla tha exoyme thn plhroforia kathe
//fora poy tha kanoyme kati get apo thn bash !

//--Document middleware-- //trexei prin .save() kai .create()
//OTAN KANEIS ENA TOUR STO CREATE TOUR tha perasei apo edw !
//TO KANEI CONSOLE LOG
//MPOROYME NA ENERGHSOYME STO TOUR PRIN PERASEI STHN BASH
tourSchema.pre('save', function (next) {
  // console.log(this); //deixnei to eggrafo poy epexergazete authn thn stigmh - to eggrafo poy apothkeyete
  this.slug = slugify(this.name, { lower: true });
  next();
}); // auto einai kati san pre save middleware (hook)
// .
//embended ενωσματωση αποκανικοποηση
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// .
tourSchema.pre('save', function (next) {
  // console.log('Will Save document..');
  next();
});

tourSchema.post('save', function (doc, next) {
  //console.log(doc);
  next();
});
//Γενικά έχουμε pre και post pre οταν θελουμε ΠΡΙΝ και Post ΜΕΤΑ
//QUERY MIDDLEWERE
//this is query object
tourSchema.pre(/^find/, function (next) {
  //ola ta strings poy xekinoyn me find find,findOne,findOneAnd ...
  // tourSchema.pre('find', function (next) {
  if (this.options.allowSecretTours) return next();
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next(); //populate all the documents that starts with find
});

tourSchema.post(/^find/, function (docs, next) {
  //thumisoy oti auto to middlewere tha trexei
  //tha trexei afou to query ektelestei
  //console.log(`query toook ${Date.now() - this.start} milliseconds!`);
  //console.log(docs);
  next();
});
//AGGREGATION MIDDLEWARE
//*unshift(start of rray) ,shift(end) prosthetoume se array *//
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //afairoume ola ta tour opoy exoun secet toour true
//   console.log(this.pipeline());
//   next();
// });
//AUTO POY THELW NA THUMASE APO AUTA EDW EINAI OTI MPOROYME NA EXOYME MIDDLEWERE POY EKTELEITE
//PRIN KAI META PX APO ENA TOUR POY PAW NA DHMIOYRGHSW H META
const Tour = mongoose.model('Tour', tourSchema);

//TO NEXT() xreiazetai alliws kollaei sto middlewere kai den proxwraei px sthn apothkeyesh
//    MONO  GIA CREATE KAI SAVE METHODOUS OXI GIA INSTERNTMANY H FINBYIDANDUPDATE
//AYTA DEN ENERGOPIHOYN AYTA TA MIDDLEWERE OTAN TREXOYN!
module.exports = Tour;
//--Quuerry Middlewere-- //
//mas epitrepei na trexoume function prin h meta apo thn ektelesh sunarthsewn
//middlewere poy trexei  prin h met apo querys

//// DOCUMENT QUERY AGGREGATION MIDDLEWARES //
//Τα < this >σe document middleware  to object deixnei sto trexon document ,
//se query to trexon query kai aggrgation antistoixa!

//!costum validators//
//validator einai apla mai sunarthsh opoy epistrefei true h false
//ara eite tha ginete acceptes oti stalthei sto etoima eite den tha ginete

//validator js (only Strings)
//εχει διαφορους validators που μπορουμε να κανουμε use
//οπως isAlpha(str, [, locale]) οπου τσεκαρει αν εχει μονο γραμματα το string

class AppError extends Error {
  //leitourgika sfalmata se olh th nefarmogh
  constructor(message, statusCode) {
    // console.log('inside Apperror');
    super(message); //parent call //pas sto costructor tou Error KAI stelneis to error ekei !!!
    this.statusCode = statusCode;
    // console.log('status code in appError : ', this.statusCode);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //ex  user creates tour xwris kapoia basika pragmata
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
    // console.log('✅ AppError module loaded');
  }
}

module.exports = AppError;
//3 ΛΑΘΗ ΠΕΡΝΑΝΕ ΜΕΧΡΙ ΣΤΙΓΜΗΣ ΤΟ CAST ERROR(LATHOS ID),DUBLICATE ERROR(STO POST AN BALEIS IDIO ONOMA)VALIDATION ERROR

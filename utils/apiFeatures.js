class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1) Filtering
    const queryObj = { ...this.queryString }; // query parameters από το URL { duration: '5', sort: 'price' }

    //console.log('query parameters απο URL ', queryObj);

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //afairoume ta excluedfields apo to queryObj
    excludedFields.forEach((el) => delete queryObj[el]);

    //afairoume ta excluedfields apo to queryObj

    // 2) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log('Query  after replace : ', JSON.parse(queryStr));
    this.query.find(JSON.parse(queryStr));

    return this; //olo to object
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this; //olo to object
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // const fields = this.queryString.fields.split(',').join('');bug testing join without space in the between
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //Αν δεν δώσει τίποτα, default είναι page = 1, limit = 100.
    //default 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // console.log(skip); //posa tours exeis perasei px sthn deuyter
    // page=1&limit=3 skip = 0 , page=2&limit=3 skip = 3
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;

const mongoose  = require('mongoose');

class MongooseHelper {

  /**
   */
  public connect  = async () =>  {
    /**
     * Connect to MongoDB.
     */
    mongoose.Promise  = Promise;
    mongoose.set('debug', (process.env.COMMON_MONGODB_DEBUG_MODE == 'true'));
    mongoose.set('useCreateIndex', true);
    mongoose.set('useNewUrlParser', true);
    mongoose.connect(process.env.COMMON_MONGODB_URI)
      .catch((err: any) => {
        console.error(err);
        console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
        process.exit();
      });
  };

}

export default new MongooseHelper;

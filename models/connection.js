const mongoose = require('mongoose');

const connectionString = process.env.CONNECTION_STRING;

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
<<<<<<< HEAD
  .catch(error => console.error(error));
=======
  .catch(error => console.error(error));
>>>>>>> 1722a0ac4e00823bf71975cb60d3d2291bf5edcd

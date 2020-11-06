const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

//Routes
const artistRoutes = require('./routes/artistRoutes');
const trackRoutes  = require('./routes/trackRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const albumRoutes = require('./routes/albumRoutes');
const userRoutes = require('./routes/userRoutes');

const handleErrors = require("../api/middlewares/handleErrors");
const unqfy = require("../api/middlewares/unqfy");

app.use(bodyParser.json());

const badParsingError = (err,req, res, next) => {
  if(err.type == 'entity.parse.failed'){
    res.status(400).send({status:400, errorCode:"BAD_REQUEST"})
  }
  else{
    next(err);
  }
};

app.use(badParsingError);

app.use(unqfy);

const api = '/api';

app.use(api + '/artists', artistRoutes);
app.use(api + '/tracks', trackRoutes);
app.use(api + '/playlists', playlistRoutes);
app.use(api + '/albums', albumRoutes);
app.use(api + '/users', userRoutes);
app.all('*', (req, res) => {
  res.status(404).send({
    status: 404,
    errorCode: "RESOURCE_NOT_FOUND"
  });
});
app.use(handleErrors);

app.listen(port, () => {
  console.log(`UNQfy app listening at http://localhost:${port}`);
});

let commandSelectorArtist = {
  addArtist : (unqfy, dataArtist) => {
    let params = { name: dataArtist[0], country: dataArtist[1] };
    return unqfy.addArtist(params);
  },

  deleteArtist : (unqfy, idParam) => {
    let id = parseInt(idParam[0]);
    return unqfy.deleteArtist(id);
  },

  getArtistById : (unqfy, idParam) => {
    let id = parseInt(idParam[0]);
    return unqfy.getArtistById(id);
  },

  getArtists : (unqfy) => {
    return unqfy.getArtists();
  },
  
  getTracksBy : (unqfy, param) => {
    const artistName = param[0];
    return unqfy.getTracksMatchingArtist(artistName);
  },
  getThisIs : (unqfy, param) => {
    const artistId = param[0];
    return unqfy.getThisIs(artistId);
  },
  getAlbumsBy : (unqfy, param) => {
    const artistName = param[0];
    return unqfy.getAlbumsForArtist(artistName);
  },
  llenar : (unqfy, param) => {
    const artistName = param[0];
    return unqfy.populateAlbumsForArtist(artistName);
  }
}

module.exports = commandSelectorArtist;

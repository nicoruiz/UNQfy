/* eslint-disable no-undef */
const picklify = require("picklify"); // para cargar/guarfar unqfy
const fs = require("fs"); // para cargar/guarfar unqfy

//Domain
const Artist = require("./domain/artist");
const Album = require("./domain/album");
const Track = require("./domain/track");
const Playlist = require("./domain/playlist");
const Usuario = require("./domain/usuario");

//Utils
const idManager = require("./utils/idManager");
const thisIsCreator = require("./thisIsCreator");
const unqfyRequester = require("./unqfyRequester");

//Clients
const MusixMatchClient = require("./externalClients/musixMatchClient");

//Errores
const InvalidDataError         = require("./error/invalidDataError");
const ResourceNameTakenError   = require("./error/resourceNameTakenError");
const NonexistentResourceError = require("./error/nonexistentResourceError");

class UNQfy {
  constructor() {
    this._playlists = [];
    this._artistas = [];
    this._usuarios = [];
    this._newArtistId = 1;
  }
  
  //Validators
  _validarExistenciaArtista(data, field, accion){
    if(field == "id" && this._artistas.every(artista => artista.id != data)){
      throw new NonexistentResourceError("Artist", data, accion);
    }
    else if(field == "name" && this._artistas.every(artista => artista.name !== data)){
      throw new NonexistentResourceError("Artist", data, accion);
    }
  }

  _validarDisponibilidadNombreArtista(data, accion){
    if(this._artistas.some(artista => artista.name == data)){
      throw new ResourceNameTakenError("Artist", data, accion);
    }
  }

  _validarExistenciaUsuario(data, accion){
    if(this._usuarios.every(usuario => usuario.username !== data)){
      throw new NonexistentResourceError("Usuario", data, accion);
    }
  }
  
  _validarDisponibilidadNombreUsuario(data, accion){
    if(this._usuarios.some(usuario => usuario.username == data)){
      throw new ResourceNameTakenError("Usuario", data, accion);
    }
  }
  
  _validarExistenciaPlaylist(data, accion){
    if(this._playlists.every(playlist => playlist.id !== data)){
      throw new NonexistentResourceError("Playlist", data, accion);
    }
  }

  _validarParametros(data, expected){
    const fields = expected.filter(field => data[field] === undefined);
    if(fields.length !== 0){
      throw new InvalidDataError(fields);
    }
  }
 
  // artistData: objeto JS con los datos necesarios para crear un artista
  //   artistData.name (string)
  //   artistData.country (string)
  // retorna: el nuevo artista creado
  addArtist(artistData) {
    /* Crea un artista y lo agrega a unqfy.
  El objeto artista creado debe soportar (al menos):
    - una propiedad name (string)
    - una propiedad country (string)
  */
    this._validarParametros(artistData, ["name", "country"]);
    this._validarDisponibilidadNombreArtista(artistData.name, "addArtist");

    const artistaNuevo = new Artist(
      idManager.idNewArtist(this),
      artistData.name,
      artistData.country
    );
    this._artistas.push(artistaNuevo);
    return artistaNuevo;
  }

  // id: id del artista a eliminar
  deleteArtist(id) {
    /* Elimina de unqfy el artista con el id indicado */
    this._validarExistenciaArtista(id, "id", "deleteArtist");

    this._artistas = this._artistas.filter((a) => a.id !== id);
    return this._artistas;
  }

  // artistData: objeto JS con los datos necesarios para actualizar un artista
  //   artistData.id (int)
  //   artistData.name (string)
  //   artistData.country (string)
  // retorna: el artista actualizado
  updateArtist(artistData) {
    this._validarExistenciaArtista(artistData.id, "id", "updateArtist");
    this._validarDisponibilidadNombreArtista(artistData.nombre, "updateArtist");

    const artistIndex = this._artistas.findIndex(a => a.id === artistData.id);
    const artistToUpdate = this._artistas[artistIndex];
    artistToUpdate._name = artistData.name;
    artistToUpdate._country = artistData.country;
    this._artistas[artistIndex] = artistToUpdate;
    
    return artistToUpdate;
  }

  // albumData: objeto JS con los datos necesarios para crear un album
  //   albumData.name (string)
  //   albumData.year (number)
  // retorna: el nuevo album creado
  addAlbum(artistId, albumData) {
    /* Crea un album y lo agrega al artista con id artistId.
    El objeto album creado debe tener (al menos):
     - una propiedad name (string)
     - una propiedad year (number)
  */
    const data = Object.assign(albumData, {id: artistId});
    this._validarParametros(data, ["id", "name", "name"]);
    let artist;
    try{
      artist = this.getArtistById(artistId);
    }
    catch(error){
      if(error instanceof NonexistentResourceError){
        error.operation = "addAlbum";
      }
      throw error;
    }
    return artist.addAlbum(albumData);
  }

  // id: id del album a eliminar
  deleteAlbum(id) {
    /* Elimina de unqfy el album con el id indicado */
    const albums = this.getArtistById(id).deleteAlbum(id);
    return albums;
  }

  // albumData: objeto JS con los datos necesarios para actualizar un album
  //   albumData.id (int)
  //   albumData.year (int)
  // retorna: el artista actualizado
  updateAlbum(albumData) {
    const artist = this.getArtistById(albumData.id);

    return artist.updateAlbum(albumData);
  }

  // trackData: objeto JS con los datos necesarios para crear un track
  //   trackData.name (string)
  //   trackData.duration (number)
  //   trackData.genres (lista de strings)
  // retorna: el nuevo track creado
  addTrack(albumId, trackData) {
    /* Crea un track y lo agrega al album con id albumId.
  El objeto track creado debe tener (al menos):
      - una propiedad name (string),
      - una propiedad duration (number),
      - una propiedad genres (lista de strings)
  */
    const album = this.getAlbumById(albumId);
    return album.addTrack(trackData);
  }

  // id: id del track a eliminar
  deleteTrack(id) {
    /* Elimina de unqfy el track con el id indicado */
    const tracks = this.getAlbumById(id).deleteTrack(id);
    return tracks;
  }

  getArtistById(id) {
    const artistId = idManager.getId("artist", id);
    this._validarExistenciaArtista(artistId, "id", "getArtistById");
    return this._artistas.find(artista => idManager.equalId("artist", id, artista.id));
  }

  getArtists() {
    return this._artistas;
  }

  getAlbumById(id) {
    const artist = this.getArtistById(idManager.getId("artist", id));
    return artist.getAlbumById(id);
  }

  getAlbumsByArtist(artistId) {
    return this.getArtistById(artistId).albums;
  }

  searchByName(name) {
    const matchs = {
      artists: [],
      albums: [],
      tracks: [],
      playlists: [],
    };
    this._artistas.forEach((artist) => artist.addIfMatchName(matchs, name));
    this._playlists.forEach((playlist) =>
      playlist.addIfMatchName(matchs, name)
    );
    return matchs;
  }

  getTrackById(id) {
    const album = this.getAlbumById(idManager.getId("album", id));
    return album.getTrackById(id);
  }

  getTracksByAlbum(albumId) {
    return this.getAlbumById(albumId).tracks;
  }

  getPlaylistById(id) {
    this._validarExistenciaPlaylist(id, "getPlaylistById");
    return this._playlists.find((p) => p.id === id);
  }

  // genres: array de generos(strings)
  // retorna: los tracks que contenga alguno de los generos en el parametro genres
  getTracksMatchingGenres(genres) {
    const tracks = [];
    this._getTracks().forEach((track) =>
      track.addIfMatchGenres(tracks, genres)
    );
    return tracks;
  }

  _getTracks() {
    let tracks = [];
    for (let x = 0; x < this._artistas.length; x++) {
      tracks = tracks.concat(
        this.getTracksMatchingArtist(this._artistas[x].name)
      );
    }
    return tracks;
  }

  // artistName: nombre de artista(string)
  // retorna: los tracks interpredatos por el artista con nombre artistName
  getTracksMatchingArtist(artistName) {
    this._validarExistenciaArtista(artistName, "name","getTracksMatchingArtist");

    const artist = this._artistas.find(
      (artista) => artistName === artista.name
    );

    return artist.albums.flatMap((album) => album.tracks);
  }

  // name: nombre de la playlist
  // genresToInclude: array de generos
  // maxDuration: duración en segundos
  // retorna: la nueva playlist creada
  createPlaylist(name, genresToInclude, maxDuration) {
    /*** Crea una playlist y la agrega a unqfy. ***
    El objeto playlist creado debe soportar (al menos):
      * una propiedad name (string)
      * un metodo duration() que retorne la duración de la playlist.
      * un metodo hasTrack(aTrack) que retorna true si aTrack se encuentra en la playlist.
    */
    this._validarParametros({name: name, genres: genresToInclude, duration: maxDuration}, 
      ["name", "genres", "duration"]);
    const playlist = new Playlist(name);
    artist_loop: for (let i = 0; i < this._artistas.length; i++) {
      const albums = this._artistas[i].albums;
      for (let j = 0; j < albums.length; j++) {
        const tracks = albums[j].tracks;
        for (let k = 0; k < tracks.length; k++) {
          const track = tracks[k];
          if (playlist.duration() + track.duration <= maxDuration) {
            if (genresToInclude.some((g) => track.hasGenre(g))) {
              playlist.addTrack(track);
              if (playlist.duration() === maxDuration) break artist_loop;
            }
          }
        }
      }
    }
    this._playlists.push(playlist);
    return playlist;
  }

  // id: id del artista a eliminar
  deletePlaylist(id) {
    /* Elimina de unqfy la playlist con el id indicado */
    this._validarExistenciaPlaylist(id, "deletePlaylist");
    this._playlists = this._playlists.filter((p) => p.id !== id);
    return this._playlists;
  }

  getPlaylists() {
    return this._playlists;
  }

  createPlaylistWithTracks(name, tracks){
    this._validarParametros({name: name, tracks: tracks}, ["name", "tracks"]);
    const playlist = new Playlist(name);
    tracks.forEach(trackId => {
      const track = this.getTrackById(trackId);
      playlist.addTrack(track);
    });
    this._playlists.push(playlist);
    return playlist;
  }

  // username: nombre del usuario (string)
  // retorna: el nuevo usuario creado
  createUsuario(username) {
    /* Crea un artista y lo agrega a unqfy. */
    this._validarParametros({username:username}, ["username"]);
    this._validarDisponibilidadNombreUsuario(username, "createUsuario");

    const usuarioNuevo = new Usuario(username);
    this._usuarios.push(usuarioNuevo);
    return usuarioNuevo;
  }

  getUsuario(username) {
    this._validarExistenciaUsuario(username, "getUsuario");

    const user = this._usuarios.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    return user;
  }

  getUsuarios() {
    return this._usuarios;
  }

  // username: username del usuario a eliminar
  deleteUsuario(username) {
    /* Elimina de unqfy el usuario con el username indicado */
    this._validarExistenciaUsuario(username, "deleteUsuario");
    this._usuarios = this._usuarios.filter((u) => u.username.toLowerCase() !== username.toLowerCase());
    return this._usuarios;
  }

  updateUsuario(username, newUsername) {
    this._validarExistenciaUsuario(username, "updateUsuario");

    const usuarioIndex = this._usuarios.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    const usuarioToUpdate = this._usuarios[usuarioIndex];
    usuarioToUpdate.username = newUsername;
    this._usuarios[usuarioIndex] = usuarioToUpdate;
    
    return usuarioToUpdate;
  }

  tracksListened(username) {
    const user = this.getUsuario(username);
    const listenedTrackIds = user.tracksListened();
    return listenedTrackIds.map((trackId) => this.getTrackById(trackId));
  }

  trackTimesListenedByUser(trackId, username) {
    const user = this.getUsuario(username);
    return user.timesListened(trackId);
  }

  listenTrack(trackId, username) {
    const user = this.getUsuario(username);
    let track;
    try {
      track = this.getTrackById(trackId);
    }
    catch(err) {
      if (err instanceof NonexistentResourceError) err.operation = "listenTrack";
      throw err;
    }
    user.listenTrack(track);
    return track;
  }

  trackTimesListened(trackId) {
    const track = this.getTrackById(trackId);
    return track.timesListened;
  }

  getThisIs(artistId) {
    const artist = this.getArtistById(artistId);
    return thisIsCreator.createThisIs(artist);
  }

  getAlbumsForArtist(artistName) {
    this._validarExistenciaArtista(artistName, "name", "getAlbumsForArtist");

    const artist = this._artistas.find(
      (artista) => artistName === artista.name
    );

    return artist.albums.map((album) => album.name);
  }

  populateAlbumsForArtist(artistName) {
    this._validarExistenciaArtista(artistName, "name", "populateAlbumsForArtist");
    return unqfyRequester
      .requestSpotify("https://api.spotify.com/v1/search", {
        q: artistName,
        type: "artist",
      })
      .then((message) => {
        const artists = message.artists.items;
        const artistId = artists[0].id;
        return unqfyRequester.requestSpotify(
          "https://api.spotify.com/v1/artists/" + artistId + "/albums",
          {limit: 50, country: "US"}
        );
      })
      .then((message) => {
        const albums = message.items;
        let albumsData = albums.map((album) => {
          return {
            name: album.name,
            year: album.release_date.substring(0, 4),
          };
        });
        albumsData = albumsData.filter(albumData => !albumData.name.includes("Deluxe Remastered Version"));
        const artist = this._artistas.find((artista) => artista.name == artistName);
        albumsData.forEach((albumData) => {
          try{
            artist.addAlbum(albumData);
          }
          catch(err){}
        });
        return artist;
      });
  }

  save(filename) {
    const serializedData = picklify.picklify(this);
    fs.writeFileSync(filename, JSON.stringify(serializedData, null, 2));
  }

  saveDefault() {
    const serializedData = picklify.picklify(this);
    fs.writeFileSync("data.json", JSON.stringify(serializedData, null, 2));
  }

  getLyrics(trackId) {
    const track = this.getTrackById(trackId);
    if (track.lyrics === null) {
      return new MusixMatchClient().getTrackLyrics(track.name).then((lyrics) => {
        track.lyrics = lyrics;
        this.save("data.json");
        return lyrics;
      });
    }
    else return Promise.resolve(track.lyrics);
  }

  searchArtists(artistName) {
    return this._artistas.filter((a) => a.name.toLowerCase().includes(artistName));
  }

  searchAlbums(albumName) {
    return this._artistas
        .reduce((acc, a) => acc.concat(a.albums), [])
        .filter((alb) => alb.name.toLowerCase().includes(albumName));
  }

  static load(filename) {
    const serializedData = fs.readFileSync(filename, { encoding: "utf-8" });
    //COMPLETAR POR EL ALUMNO: Agregar a la lista todas las clases que necesitan ser instanciadas
    const classes = [UNQfy, Artist, Album, Track, Playlist, Usuario];
    return picklify.unpicklify(JSON.parse(serializedData), classes);
  }

  get newArtistId() {
    return this._newArtistId++;
  }
}

// COMPLETAR POR EL ALUMNO: exportar todas las clases que necesiten ser utilizadas desde un modulo cliente
module.exports = {
  UNQfy: UNQfy,
};




const fs = require('fs'); // necesitado para guardar/cargar unqfy
const unqmod = require('./unqfy'); // importamos el modulo unqfy
const commandSelector = require('./commandSelector/commandSelector'); // importamos los comandos a ejecutar

//Error
const NonexistentCommandError = require('./error/nonexistentCommandError');

// Retorna una instancia de UNQfy. Si existe filename, recupera la instancia desde el archivo.
function getUNQfy(filename = "data.json") {
  let unqfy = new unqmod.UNQfy();
  if (fs.existsSync(filename)) {
    unqfy = unqmod.UNQfy.load(filename);
  }
  return unqfy;
}

function saveUNQfy(unqfy, filename = "data.json") {
  unqfy.save(filename);
}

/*
 En esta funcion deberán interpretar los argumentos pasado por linea de comandos
 e implementar los diferentes comandos.

  Se deberán implementar los comandos:
    - Alta y baja de Artista
    - Alta y Baja de Albums
    - Alta y Baja de tracks

    - Listar todos los Artistas
    - Listar todos los albumes de un artista
    - Listar todos los tracks de un album

    - Busqueda de canciones intepretadas por un determinado artista
    - Busqueda de canciones por genero

    - Dado un string, imprimmir todas las entidades (artistas, albums, tracks, playlists) que coincidan parcialmente
    con el string pasado.

    - Dada un nombre de playlist, una lista de generos y una duración máxima, crear una playlist que contenga
    tracks que tengan canciones con esos generos y que tenga como duración máxima la pasada por parámetro.

  La implementacion de los comandos deberá ser de la forma:
   1. Obtener argumentos de linea de comando
   2. Obtener instancia de UNQfy (getUNQFy)
   3. Ejecutar el comando correspondiente en Unqfy
   4. Guardar el estado de UNQfy (saveUNQfy)

*/

const dataFromArgs = args => args.slice(3, args.length);

function main() {
  const command = process.argv[2];
  const parameters = dataFromArgs(process.argv);
  const unqfy = getUNQfy();
  const resultado = commandSelector.select(command)(unqfy, parameters);
  Promise.resolve(resultado)
    .then(res => {
      console.log(res)
      saveUNQfy(unqfy)
    })
    .catch(error => console.log(error.message));
  
  //try{
  //  resultado = commandSelector.select(command)(unqfy, parameters);
  //  console.log(resultado);
  //}
  //catch(error){
  //  console.log(error.message);
  //}
  //if(!(resultado instanceof Promise)){
  //  saveUNQfy(unqfy);
  //}
}

main();

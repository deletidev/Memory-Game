import { Tablero, IdSonidosPartida, tablero } from './modelo';
import {
  sePuedeVoltearLaCarta,
  voltearLaCarta,
  sonPareja,
  parejaEncontrada,
  parejaNoEncontrada,
  esPartidaCompleta,
  iniciaPartidaMotor
} from './motor';
import { confettiMio } from './confetti';
import sonidoOn from '/sound-high.svg';
import sonidoOff from '/sound-off.svg';

//Cambio src de img
const srcImg = (indice: number, tablero: Tablero): void => {
  const cardImg = document.querySelector(`img[data-indice-id = "${indice}"]`);
  console.log(cardImg);
  if (cardImg && cardImg instanceof HTMLImageElement) {
    cardImg.src = tablero.cartas[indice].imagen;
  }
};

//Dar la vuelta a las cartas
const cartasBocaAbajo = (...cartas: Element[]): void => {
  cartas.forEach(carta => {
    if (carta && carta instanceof HTMLDivElement) {
      carta.dataset.state = 'back';
    }
  });
};

//Borro img de las cartas
const borroImg = (...imagenes: Element[]): void => {
  imagenes.forEach(imagen => {
    if (imagen instanceof HTMLImageElement) {
      imagen.src = '';
    }
  });
};

//Cartas boca Arriba
const cartaBocaArriba = (card: Element): void => {
  if (card && card instanceof HTMLDivElement) {
    card.dataset.state = 'front';
  }
};

//Reproducir sonidos
const reproducirSonido = (sonido: IdSonidosPartida): void => {
  const sound = document.getElementById(sonido);
  if (sound && sound instanceof HTMLAudioElement) {
    sound.play();
  }
};

//Mutar sonidos
const muteSonido = (boton: HTMLButtonElement): void => {
  //Cambio la img
  const imgBtn = boton.children[0];
  if (imgBtn && imgBtn instanceof HTMLImageElement) {
    imgBtn.src = sonidoOff;
  }
  //Muteo todos los audios
  const sounds = Array.from(document.querySelectorAll('audio'));
  sounds.forEach(sound => {
    if (sound && sound instanceof HTMLAudioElement) {
      sound.muted = true;
    }
  });
};

//Quiar el mute a sonidos
const volumenSonido = (boton: HTMLButtonElement): void => {
  //Cambio la img
  const imgBtn = boton.children[0];
  if (imgBtn && imgBtn instanceof HTMLImageElement) {
    imgBtn.src = sonidoOn;
  }
  //sonido todos los audios
  const sounds = Array.from(document.querySelectorAll('audio'));
  sounds.forEach(sound => {
    if (sound && sound instanceof HTMLAudioElement) {
      sound.muted = false;
    }
  });
};

//Imprimir movimientos
const imprimirMovimientos = (movimientos: number): void => {
  const spanMovientos = document.getElementById('intentos-number');
  if (spanMovientos && spanMovientos instanceof HTMLElement) {
    spanMovientos.textContent = movimientos.toString();
  }
};

//Mostrar el mensaje
const mensajeShow = (): void => {
  const mensaje = document.getElementById('mensaje');
  if (mensaje && mensaje instanceof HTMLDivElement) {
    mensaje.classList.remove('oculto');
  }
};

//ocultar el mensaje
const mensajeHiden = (): void => {
  const mensaje = document.getElementById('mensaje');
  if (
    mensaje &&
    mensaje instanceof HTMLDivElement &&
    !mensaje.classList.contains('oculto')
  ) {
    mensaje.classList.add('oculto');
  }
};

//  acciones al voltear la carta
const revelarCartaAcciones = (
  tablero: Tablero,
  carta: Element,
  index: number
): void => {
  //play al sonido carta
  reproducirSonido('sound-card');

  //apunto la posicion volteada en el tablero
  voltearLaCarta(index, tablero);

  //doy src a la img
  srcImg(index, tablero);

  //doy la vuelta a la carta
  cartaBocaArriba(carta);
};

//  acciones ui son pareja
const accionesPareja = (
  tablero: Tablero,
  indiceA: number,
  indiceB: number
): void => {
  //sonido para escuchar que se de la vuelta a la carta y luego el sonido de pareja
  setTimeout(() => {
    reproducirSonido('sound-match');
  }, 300);

  //cambio estado a las cartas, a encontradas
  parejaEncontrada(tablero, indiceA, indiceB);
  imprimirMovimientos(tablero.movimientos);
};

const tiempoBrorrarImgCartas = (cardImgA: Element, cardImgB: Element) => {
  setTimeout(() => {
    borroImg(cardImgA, cardImgB);
  }, 100);
};

//  acciones ui No son pareja
const accionesNoPareja = (
  tablero: Tablero,
  indiceA: number,
  indiceB: number,
  cartas: Element[]
): void => {
  const cartaA = cartas[indiceA];
  const cartaB = cartas[indiceB];
  const cardImgA = document.querySelector(`img[data-indice-id = "${indiceA}"]`);
  const cardImgB = document.querySelector(`img[data-indice-id = "${indiceB}"]`);
  if (
    cartaA instanceof HTMLDivElement &&
    cartaB instanceof HTMLDivElement &&
    cardImgA &&
    cardImgB
  ) {
    reproducirSonido('sound-error');
    cartasBocaAbajo(cartaA, cartaB);
    parejaNoEncontrada(tablero, indiceA, indiceB);
    tiempoBrorrarImgCartas(cardImgA, cardImgB);
    imprimirMovimientos(tablero.movimientos);
  }
};

const tiempoAccionesNoPareja = (
  tablero: Tablero,
  indiceA: number,
  indiceB: number,
  array: Element[]
): void => {
  setTimeout(() => {
    accionesNoPareja(tablero, indiceA, indiceB, array);
  }, 500);
};

const dosCartasLevantadasFc = (tablero: Tablero, array: Element[]): void => {
  //Si hay dos cartas levantadas ¿son pareja?
  const indiceA = tablero.indiceCartaVolteadaA;
  const indiceB = tablero.indiceCartaVolteadaB;
  //obligatorio undefined por tema del 0, indice del array
  if (
    indiceA !== undefined &&
    indiceB !== undefined &&
    tablero.estadoPartida === 'DosCartasLevantadas'
  ) {
    //miro si son pareja
    sonPareja(tablero, indiceA, indiceB)
      ? accionesPareja(tablero, indiceA, indiceB)
      : tiempoAccionesNoPareja(tablero, indiceA, indiceB, array);
  }
};

//  acciones al completar la partida
const accionesPartidaCompleta = (): void => {
  reproducirSonido('sound-win');
  confettiMio();
  mensajeShow();
};

//  tiempo de espera para generar las acciones de partida completa
const esperaAccionesPartidaCompleta = () => {
  //tengo setTimeout por duraciones de los sonidos para que no se acoplen o no se oigan
  setTimeout(accionesPartidaCompleta, 600);
};

//  acciones al hacer click en un carta
const cartaClick = (
  tablero: Tablero,
  index: number,
  carta: Element,
  array: Element[]
): void => {
  //Miro si la carta es volteable
  sePuedeVoltearLaCarta(tablero, index)
    ? (revelarCartaAcciones(tablero, carta, index),
      dosCartasLevantadasFc(tablero, array))
    : reproducirSonido('sound-error');

  //Miro si la partida está completa
  if (esPartidaCompleta(tablero)) {
    esperaAccionesPartidaCompleta();
  }
};

//  Añado eventos a las cartas
export const prepararPartida = (): void => {
  const cartasMesa = Array.from(document.getElementsByClassName('card'));
  cartasMesa.forEach((carta, index, array) => {
    if (carta && carta instanceof HTMLDivElement) {
      carta.addEventListener('click', () => {
        if (tablero.estadoPartida !== 'PartidaNoIniciada') {
          cartaClick(tablero, index, carta, array);
        }
      });
    }
  });
};

//iniciar partida ui
const iniciarPartidaUi = (tablero: Tablero): void => {
  const cartasMesa = Array.from(document.getElementsByClassName('card'));
  const htmlImg = document.getElementsByClassName('card__img');
  cartasBocaAbajo(...cartasMesa);
  imprimirMovimientos(tablero.movimientos);
  mensajeHiden();

  if (htmlImg.length !== 0) {
    const imagenes = Array.from(htmlImg);
    borroImg(...imagenes);
  }
};

export const iniciarPartida = (tablero: Tablero): void => {
  iniciaPartidaMotor(tablero);
  iniciarPartidaUi(tablero);
};

//ui boton sonido
export const toogleSonido = (boton: HTMLButtonElement): void => {
  boton.classList.toggle('mute');
  boton.classList.contains('mute') ? muteSonido(boton) : volumenSonido(boton);
};

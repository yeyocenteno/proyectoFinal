import { Injectable } from '@angular/core';

export interface Integrante {
  nombre: string;
  id: string;
  edad: number;
  foto: string;
  carrera: string;
  semestre: string;
}


@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private integrantes: Integrante[] = [
    {
      nombre: 'Tadeo Andrade Sustaita',
      id: '353079',
      edad: 20,
      foto: 'assets/tadeo.jpg',
      carrera: 'Ing. en Sistemas Computacionales',
      semestre: '6° C'
    },
    {
      nombre: 'Diego Saldaña Centeno',
      id: '262737',
      edad: 20,
      foto: 'assets/deigo.png',
      carrera: 'Ing. en Sistemas Computacionales',
      semestre: '6° C'
    },
    {
      nombre: 'Cindy Fabiola Hernandez Muñoz',
      id: '350114',
      edad: 20,
      foto: 'assets/fabi.jpg',
      carrera: 'Ing. en Sistemas Computacionales',
      semestre: '6° C'
    },
    {
      nombre: 'Reyli Uvaldo Martinez Hernandez',
      id: '350944',
      edad: 20,
      foto: 'assets/reyli.jpg',
      carrera: 'Ing. en Sistemas Computacionales',
      semestre: '6° C'
    },
    {
      nombre: 'Juan Carlos Uriarte Padilla',
      id: '281537',
      edad: 20,
      foto: 'assets/juanca.jpg',
      carrera: 'Ing. en Sistemas Computacionales',
      semestre: '6° C'
    }
  ];

  getIntegrantes(): Integrante[] {
    return this.integrantes;
  }
  constructor() { }
}

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
      nombre: 'Ricardo Almada Díaz',
      id: '281466',
      edad: 20,
      foto: 'assets/ricardo.jpg',
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
      nombre: 'Jaime López Martíenz',
      id: '347301',
      edad: 20,
      foto: 'assets/jaime.jpg',
      carrera: 'Ing. en Sistemas Computacionales',
      semestre: '6° C'
    }
  ];

  getIntegrantes(): Integrante[] {
    return this.integrantes;
  }
  constructor() { }
}

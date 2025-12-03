// src/app/services/cliente.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Necesario para hacer peticiones
import { Observable } from 'rxjs'; // Necesario para tipar el retorno

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la aplicación
})
export class ClienteService {

  // La URL base de tu backend Node.js
  private apiUrl = 'http://localhost:3000/api'; 

  // Inyectamos HttpClient en el constructor para poder usarlo
  constructor(private http: HttpClient) { }

   // 1. Crear Cliente
  crearCliente(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes`, data);
  }

  // Aquí agregarías la función de alta de inscripción:
  registrarInscripcionCompleta(datosInscripcion: any): Observable<any> {
    // Esto llama a tu backend de Express en POST /api/inscripciones
    return this.http.post<any>(`${this.apiUrl}/inscripciones`, datosInscripcion);
  }
}
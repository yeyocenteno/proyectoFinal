import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Curso {
  id_clase: number;
  nombre: string;
  descripcion: string;
  intensidad: string;
  duracion: number;
  entrenador: string;
  capacidad: number;
  horario: string;
  imagen_url: string;

  hover?: boolean; // <-- Agregado
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = "http://localhost:3000/api/cursos"; // Endpoint que usa la vista V_CURSOS_API
  private clasesUrl = "http://localhost:3000/clases"; // Endpoint para CRUD

  constructor(private http: HttpClient) {}

  // Obtener todos los cursos
  obtenerCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  // Obtener un curso por ID
  obtenerCursoPorId(id: string): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  // Eliminar curso
  eliminarCurso(id: number): Observable<any> {
    return this.http.delete(`${this.clasesUrl}/${id}`);
  }

  // Editar curso
  editarCurso(id: number, datos: Partial<Curso>): Observable<Curso> {
    return this.http.put<Curso>(`${this.clasesUrl}/${id}`, datos);
  }

  // Crear curso (opcional, si quieres agregar desde admin)
  crearCurso(datos: Partial<Curso>): Observable<Curso> {
    return this.http.post<Curso>(this.clasesUrl, datos);
  }

  eliminaCurso(id: string) {
  return this.http.delete(`${this.apiUrl}/clases/${id}`);
}

actualizarCurso(id: string, data: any) {
  return this.http.put(`${this.apiUrl}/clases/${id}`, data);
}

}

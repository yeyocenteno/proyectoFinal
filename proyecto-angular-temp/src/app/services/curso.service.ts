import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  intensidad: string;
  imagen: string;

  categoria?: string;
  requisitos?: string;
  instructor?: string;
  cupos?: number;
  ubicacion?: string;
  horarios?: string[];
  beneficios?: string[];
}
@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl="https://cursogym.free.beeceptor.com"

  constructor( private http: HttpClient) {
    
   }
   obtenerCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }
  obtenerCursoPorId(id: string): Observable<Curso> {
    return this.http.get<Curso[]>(this.apiUrl).pipe(
      map((cursos: Curso[]) => cursos.find((c: Curso) => c.id === Number(id)) as Curso)

    );
  }


}

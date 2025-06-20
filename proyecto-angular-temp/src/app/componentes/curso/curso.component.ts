import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Curso, CursoService } from '../../services/curso.service';
import { RouterModule } from '@angular/router';
import { BusquedaComponent } from '../busqueda/busqueda.component';

@Component({
  selector: 'app-curso',
  standalone: true,
  imports: [CommonModule, RouterModule, BusquedaComponent],
  templateUrl: './curso.component.html',
  styleUrl: './curso.component.css'
})
export class CursoComponent implements OnInit {
  cursos: Curso[] = [];
  cursosFiltrados: Curso[] = []; // Nombre actualizado para que coincida con el HTML
  loading = false; // bandera de carga

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
    this.loading = true; // comienza la carga
    this.cursoService.obtenerCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cursosFiltrados = data;
        this.loading = false;
      },
      error: (err) => {console.error('Error al obtener cursos', err);
      this.loading = false;
      }
    });
  }

  busqueda(searchTerm: string): void {
    if (searchTerm) {
      this.cursosFiltrados = this.cursos.filter((curso) =>
        curso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.cursosFiltrados = this.cursos;
    }
  }
}

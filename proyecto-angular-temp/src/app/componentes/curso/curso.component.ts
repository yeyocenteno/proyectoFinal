import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Curso, CursoService } from '../../services/curso.service';
import { RouterModule } from '@angular/router';
import { BusquedaComponent } from '../busqueda/busqueda.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-curso',
  standalone: true,
  imports: [CommonModule, RouterModule, BusquedaComponent],
  templateUrl: './curso.component.html',
  styleUrl: './curso.component.css'
})
export class CursoComponent implements OnInit {
  cursos: Curso[] = [];
  cursosFiltrados: Curso[] = [];
  loading = false;
  rolUsuario: string = 'admin'; // Esto lo puedes obtener desde AuthService

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.loading = true;
    this.cursoService.obtenerCursos().subscribe({
      next: (data) => {
        this.cursos = data.map(c => ({ ...c, hover: false })); // agregamos hover
        this.cursosFiltrados = [...this.cursos];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener cursos', err);
        this.loading = false;
      }
    });
  }

  busqueda(searchTerm: string): void {
    if (searchTerm && searchTerm.trim() !== '') {
      this.cursosFiltrados = this.cursos.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.cursosFiltrados = [...this.cursos];
    }
  }

  trackById(index: number, item: Curso) {
    return item.id_clase;
  }

  // =========================
  // ELIMINAR CURSO
  // =========================
  eliminarCurso(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el curso permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.cursoService.eliminarCurso(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El curso ha sido eliminado.', 'success');
            this.cargarCursos();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar el curso.', 'error');
          }
        });
      }
    });
  }

  // =========================
  // EDITAR CURSO
  // =========================
  editarCurso(curso: Curso) {
    Swal.fire({
      title: 'Editar curso',
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${curso.nombre}">
        <input id="swal-descripcion" class="swal2-input" placeholder="Descripción" value="${curso.descripcion}">
        <input id="swal-intensidad" class="swal2-input" placeholder="Intensidad" value="${curso.intensidad}">
        <input id="swal-duracion" class="swal2-input" placeholder="Duración (min)" value="${curso.duracion}">
        <input id="swal-capacidad" class="swal2-input" placeholder="Capacidad" value="${curso.capacidad}">
        <input id="swal-horario" class="swal2-input" placeholder="Horario" value="${curso.horario}">
        <input id="swal-imagen" class="swal2-input" placeholder="URL Imagen" value="${curso.imagen_url}">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          nombre: (document.getElementById('swal-nombre') as HTMLInputElement).value,
          descripcion: (document.getElementById('swal-descripcion') as HTMLInputElement).value,
          intensidad: (document.getElementById('swal-intensidad') as HTMLInputElement).value,
          duracion: (document.getElementById('swal-duracion') as HTMLInputElement).value,
          capacidad: Number((document.getElementById('swal-capacidad') as HTMLInputElement).value),
          horario: (document.getElementById('swal-horario') as HTMLInputElement).value,
          imagen_url: (document.getElementById('swal-imagen') as HTMLInputElement).value,
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.cursoService.editarCurso(curso.id_clase, result.value!).subscribe({
          next: () => {
            Swal.fire('Actualizado', 'El curso ha sido actualizado.', 'success');
            this.cargarCursos();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo actualizar el curso.', 'error');
          }
        });
      }
    });
  }
}

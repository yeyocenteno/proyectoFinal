import { Component, OnInit } from '@angular/core';
import { Curso, CursoService } from '../../services/curso.service';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, Location } from '@angular/common';
import { GaleriaComponent } from '../galeria/galeria.component';
import { IntensidadPipe } from '../../pipes/intensidad.pipe';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule, 
    MatInputModule,
    GaleriaComponent,
    IntensidadPipe
  ],
  templateUrl: './curso-detalle.component.html',
  styleUrl: './curso-detalle.component.css'
})
export class CursoDetalleComponent implements OnInit {

  curso: Curso | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private cursoService: CursoService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    setTimeout(() => {
      window.scrollTo({
        top: 100,
        behavior: 'smooth'
      });
    }, 0);

    if (id) {
      this.loading = true;
      this.cursoService.obtenerCursoPorId(id).subscribe({
        next: (data) => {
          console.log('DATA RECIBIDA:', data);  // 👈 AGREGA ESTO
          this.curso = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al obtener el curso:', err);
          this.loading = false;
        }
      });
    }
  }

  editarCurso() {
  if (!this.curso) return;
  // 👇 Cambia esta ruta según tu app
  window.location.href = `/editar-curso/${this.curso.id_clase}`;
}

eliminarCurso() {
  if (!this.curso) return;

  if (!confirm("¿Seguro que deseas eliminar este curso?")) return;

  this.cursoService.eliminarCurso(this.curso.id_clase!).subscribe({
    next: (resp) => {
      alert("Curso eliminado correctamente");
      this.goBack();
    },
    error: (err) => {
      console.error("Error al eliminar curso:", err);
      alert("Error al eliminar el curso");
    }
  });
}


  goBack(): void {
    this.location.back();
  }
}

import { Component, OnInit } from '@angular/core';
import { Curso, CursoService } from '../../services/curso.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, Location } from '@angular/common';
import { GaleriaComponent } from '../galeria/galeria.component';
import { IntensidadPipe } from '../../pipes/intensidad.pipe';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule,GaleriaComponent, IntensidadPipe],
  templateUrl: './curso-detalle.component.html',
  styleUrl: './curso-detalle.component.css'
})
export class CursoDetalleComponent implements OnInit {
  curso: Curso | null = null;
  loading = true; 

  constructor(
    private route: ActivatedRoute,
    private cursoService: CursoService,
    private location:Location
  ) {}

    ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id');
      
            setTimeout(() => {
        window.scrollTo({
          top: 100, // Puedes ajustar el margen superior
          behavior: 'smooth'
        });
      }, 0);
      if (id) {
        this.loading = true; // inicio loading
        this.cursoService.obtenerCursoPorId(id).subscribe({
          next: (data) => {
            this.curso = data;
            this.loading = false;  // carga finalizada
          },
          error: (err) => {
            console.error('Error al obtener el curso:', err);
            this.loading = false;  // carga finalizada, aunque con error
          }
        });
      }
    }
    
    goBack(): void {
      this.location.back();
    }
}


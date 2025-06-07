import { Component, OnInit } from '@angular/core';
import { Curso, CursoService } from '../../services/curso.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Location } from '@angular/common';
@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './curso-detalle.component.html',
  styleUrl: './curso-detalle.component.css'
})
export class CursoDetalleComponent implements OnInit {
  curso: Curso | null = null;

  constructor(
    private route: ActivatedRoute,
    private cursoService: CursoService,
    private location:Location
  ) {}

    ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.cursoService.obtenerCursoPorId(id).subscribe({
          next: (data) => this.curso = data,
          error: (err) => {
            console.error('Error al obtener el curso:', err);
          }
        });
      }
    }
    goBack(): void {
  this.location.back();
}
}


import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { EquipoService, Integrante } from '../equipo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tablas',
  imports: [CommonModule],
  templateUrl: './tablas.component.html',
  styleUrl: './tablas.component.css'
})
export class TablasComponent {
  integrantes: Integrante[]=[];
   suscripciones: any[] = [];
  quejas: any[] = [];

  constructor(private equipoService: EquipoService,private router: Router) {
    this.cargarDatos();
  }

  cargarDatos() {
        const datosSuscripciones = localStorage.getItem('suscripciones');
      this.suscripciones = datosSuscripciones ? JSON.parse(datosSuscripciones) : [];

      this.integrantes = this.equipoService.getIntegrantes();
      const datos = localStorage.getItem('quejas');
      this.quejas = datos ? JSON.parse(datos) : [];
    }

  eliminarSuscripcion(index: number) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la suscripción.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      this.suscripciones.splice(index, 1);
      localStorage.setItem('suscripciones', JSON.stringify(this.suscripciones)); // ✅ actualizar localStorage
      Swal.fire('Eliminado', 'La suscripción ha sido eliminada.', 'success');
    }
  });
}


eliminarQueja(index: number) {
  Swal.fire({
    title: '¿Eliminar queja?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      this.quejas.splice(index, 1);
      localStorage.setItem('quejas', JSON.stringify(this.quejas)); // ✅ Guarda el nuevo arreglo actualizado
      Swal.fire('Eliminada', 'La queja ha sido eliminada.', 'success');
    }
  });
}

  

editarRegistro(tipo: 'suscripcion' | 'queja', index: number) {
  localStorage.setItem('registroEditando', JSON.stringify({ tipo, index }));

  if (tipo === 'suscripcion') {
    this.router.navigate(['/suscripcion']);
  } else if (tipo === 'queja') {
    this.router.navigate(['/nosotros']);
  }
}
}
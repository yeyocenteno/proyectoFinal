import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Queja } from '../queja.interface';
import { CommonModule } from '@angular/common';
import { EquipoService, Integrante } from '../equipo.service';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent {
  integrantes: Integrante[] = [];
  queja: Queja = {
    nombre: '',
    correo: '',
    motivo: '',
    fecha: '',
    opciones: [],
    gravedad: ''
  };
  hoy = new Date().toISOString().split('T')[0]; // Para restringir la fecha al día actual o anterior
  motivos: string[] = ['Instalaciones', 'Entrenadores', 'Cobros', 'Otros'];
  opcionesDisponibles: string[] = ['Ruido excesivo', 'Malos tratos', 'Equipos dañados'];
  submitted = false;
  editando = false;
  indiceEditando = -1;


  constructor(private equipoService: EquipoService) {}

  ngOnInit(): void {
  this.integrantes = this.equipoService.getIntegrantes();

  const registro = localStorage.getItem('registroEditando');
  if (registro) {
    const { tipo, index } = JSON.parse(registro);
    if (tipo === 'queja') {
      const quejas = JSON.parse(localStorage.getItem('quejas') || '[]');
      const datos = quejas[index];
      if (datos) {
        this.editando = true;
        this.indiceEditando = index;
        this.queja = { ...datos }; // copia segura
      }
    }
  }
}


  isValid(): boolean {
  return (
    this.queja.nombre.length >= 10 &&
    this.validateEmail(this.queja.correo) &&
    this.queja.motivo.length >= 10 &&
    this.queja.fecha !== '' &&
    this.esFechaEnRangoValido() &&
    this.queja.opciones.length > 0 &&
    this.queja.gravedad !== ''
  );
}


esFechaEnRangoValido(): boolean {
  if (!this.queja.fecha) return false;

  const fechaSeleccionada = new Date(this.queja.fecha);
  const hoy = this.getToday();

  const diezDiasDespues = new Date(hoy);
  diezDiasDespues.setDate(hoy.getDate() + 10);

  return fechaSeleccionada >= hoy && fechaSeleccionada <= diezDiasDespues;
}

  getToday(): Date {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

    onSubmit() {
  this.submitted = true;
  if (this.isValid()) {
    const quejasGuardadas = JSON.parse(localStorage.getItem('quejas') || '[]');
    if (this.editando && this.indiceEditando > -1) {
      quejasGuardadas[this.indiceEditando] = this.queja;
    } else {
      quejasGuardadas.push(this.queja);
    }
    localStorage.setItem('quejas', JSON.stringify(quejasGuardadas));
    localStorage.removeItem('registroEditando');

    Swal.fire({
      icon: 'success',
      title: this.editando ? '¡Queja actualizada!' : '¡Queja registrada!',
      text: this.editando
        ? 'Tu queja ha sido actualizada correctamente.'
        : 'Gracias por compartir tu opinión. Trabajaremos en ello.',
    });

    this.queja = {
      nombre: '',
      correo: '',
      motivo: '',
      fecha: '',
      opciones: [],
      gravedad: ''
    };
    this.submitted = false;
    this.editando = false;
    this.indiceEditando = -1;
  }
}




  tieneOpcionesSeleccionadas(): boolean {
  return this.queja.opciones.some(o => o);
}
esFechaValida(): boolean {
  if (!this.queja.fecha) return false;
  return new Date(this.queja.fecha) >= this.getToday();
}

handleChange(event: Event, opcion: string): void {
  const input = event.target as HTMLInputElement;
  if (input.checked) {
    this.queja.opciones.push(opcion);
  } else {
    const index = this.queja.opciones.indexOf(opcion);
    if (index > -1) {
      this.queja.opciones.splice(index, 1);
    }
  }
}

}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Queja } from '../queja.interface';
import { CommonModule } from '@angular/common';
import { EquipoService, Integrante } from '../equipo.service';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection,addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent {
  currentUserEmail: string | null = null;
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


  constructor(private equipoService: EquipoService, private authService: AuthService, private firestore: Firestore) {}

  ngOnInit(): void {
    
    this.authService.user$.subscribe(user => {
    this.currentUserEmail = user?.email || null;
  });

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

   async onSubmit() {
  this.submitted = true;

  if (this.isValid()) {
    try {
      const quejaConFecha = {
        ...this.queja,
        fechaRegistro: new Date().toISOString(),
      };
      
      // Aquí está la llamada al API de Firestore que guarda el documento:
      // addDoc recibe la referencia a la colección 'quejas' y el objeto que se guardará
      await addDoc(collection(this.firestore, 'quejas'), quejaConFecha);

      Swal.fire({
        icon: 'success',
        title: this.editando ? '¡Queja actualizada!' : '¡Queja registrada!',
        text: 'Gracias por compartir tu opinión. Trabajaremos en ello.',
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
    } catch (error) {
      console.error('Error al guardar la queja en Firestore:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar la queja. Intenta más tarde.',
      });
    }
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

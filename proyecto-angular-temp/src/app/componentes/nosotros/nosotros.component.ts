import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Queja } from '../queja.interface';
import { CommonModule } from '@angular/common';
import { EquipoService, Integrante } from '../equipo.service';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection,addDoc } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

interface Entrenador {
  id_entrenador: number;
  nombre: string;
  especialidad: string;
  horario: string;
  correo: string;
  telefono: string;
  foto?: string; // Opcional, si quieres agregar imagen
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent {
 entrenadores: Entrenador[] = [];
  loading: boolean = true;
  error: string = '';

  nuevoEntrenador: Partial<Entrenador> = {};
  successMessage: string = '';
  errorMessage: string = '';

  // Cambia el URL a tu backend si es necesario
  private backendUrl = 'http://localhost:3000/entrenadores';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarEntrenadores();
  }

   cargarEntrenadores(): void {
    this.loading = true;
    this.http.get<Entrenador[]>(this.backendUrl).subscribe({
      next: (data) => {
        this.entrenadores = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando entrenadores:', err);
        this.error = 'No se pudo cargar la lista de entrenadores';
        this.loading = false;
      }
    });
  }

  agregarEntrenador(form: NgForm): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!form.valid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    this.http.post(this.backendUrl, this.nuevoEntrenador).subscribe({
      next: (res: any) => {
        this.successMessage = 'Entrenador agregado correctamente!';
        // Limpiar formulario
        this.nuevoEntrenador = {};
        form.resetForm();
        // Recargar lista
        this.cargarEntrenadores();
      },
      error: (err) => {
        console.error('Error agregando entrenador:', err);
        this.errorMessage = err.error?.error || 'Ocurrió un error al agregar el entrenador';
      }
    });
  }

  eliminarEntrenador(id: number) {
  Swal.fire({
    title: "¿Eliminar entrenador?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(result => {
    if (result.isConfirmed) {
      this.http.delete(`${this.backendUrl}/${id}`).subscribe({
        next: () => {
          Swal.fire("Eliminado", "El entrenador ha sido eliminado", "success");
          this.cargarEntrenadores(); // Recargar lista
        },
        error: (err) => {
          console.error("Error al eliminar:", err);
          Swal.fire("Error", "No se pudo eliminar el entrenador", "error");
        }
      });
    }
  });
}


// En nosotros.component.ts
editarEntrenador(entrenador: Entrenador) {
  Swal.fire({
    title: "Editar Entrenador",
    html: `
      <input id="nombre" class="swal2-input" value="${entrenador.nombre || ''}" placeholder="Nombre">
      <input id="especialidad" class="swal2-input" value="${entrenador.especialidad || ''}" placeholder="Especialidad">
      <input id="horario" class="swal2-input" value="${entrenador.horario || ''}" placeholder="Horario">
      <input id="correo" class="swal2-input" value="${entrenador.correo || ''}" placeholder="Correo">
      <input id="telefono" class="swal2-input" value="${entrenador.telefono || ''}" placeholder="Teléfono">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar cambios",
    cancelButtonText: "Cancelar",

    /* VALIDACIÓN aquí */
    preConfirm: () => {
      const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value.trim();
      const correo = (document.getElementById("correo") as HTMLInputElement)?.value.trim();
      const especialidad = (document.getElementById("especialidad") as HTMLInputElement)?.value.trim();
      const horario = (document.getElementById("horario") as HTMLInputElement)?.value.trim();
      const telefono = (document.getElementById("telefono") as HTMLInputElement)?.value.trim();

      if (!nombre || !correo) {
        Swal.showValidationMessage("El nombre y el correo son campos obligatorios.");
        return false;
      }

      return { nombre, correo, especialidad, horario, telefono };
    }
  }).then(result => {

    // Si el usuario canceló, salir
    if (!result.isConfirmed) return;

    this.http.put(`${this.backendUrl}/${entrenador.id_entrenador}`, result.value).subscribe({
      next: () => {
        Swal.fire("Actualizado", "Datos actualizados correctamente", "success");
        this.cargarEntrenadores();
      },
      error: (err) => {
        console.error("Error actualizando:", err);
        Swal.fire("Error", err.error?.error || "No se pudo actualizar el entrenador", "error");
      }
    });
  });
}


  }

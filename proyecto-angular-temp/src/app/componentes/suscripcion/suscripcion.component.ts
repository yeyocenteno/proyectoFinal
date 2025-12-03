import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { PlanesComponent } from '../planes/planes.component';
import { DomseguroPipe } from '../domseguro.pipe';
import { ClienteService } from '../../services/cliente.service';
import { HttpClientModule } from '@angular/common/http';


@Component({
selector: 'app-suscripcion',
standalone: true,
imports: [CommonModule, ReactiveFormsModule, PlanesComponent, DomseguroPipe, HttpClientModule, RouterOutlet],
templateUrl: './suscripcion.component.html',
styleUrl: './suscripcion.component.css'
})
export class SuscripcionComponent implements OnInit {
suscripcionForm: FormGroup;
planes = ['Básico', 'Intermedio', 'Avanzado'];
objetivos = ['Perder peso', 'Ganar masa muscular', 'Mantener condición'];
editando = false;
hovering = false;
video:string="I_RYujJvZ7s"; 

indiceEditando = -1;

currentUserEmail: string | null = null; // 🔥 AÑADE ESTO
currentUserUid: string | null = null;  

constructor(private fb: FormBuilder, private clienteService: ClienteService) {
  this.suscripcionForm = this.fb.group({
  nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      fecha: ['', [Validators.required, this.fechaNoPasadaValidator, this.fechaRangoValida]],
      plan: ['', Validators.required],
      objetivos: this.buildObjetivos(),
      genero: ['', Validators.required],
    });
  }

ngOnInit() {
  // Aquí ya no hay lógica de localStorage
}

  buildObjetivos(): FormArray {
    return this.fb.array(
      this.objetivos.map(() => this.fb.control(false)),
      this.minimoUnoSeleccionado
    );
  }

  minimoUnoSeleccionado(control: AbstractControl) {
    const formArray = control as FormArray;
    return formArray.value.some((val: boolean) => val)
      ? null
      : { requerido: true };
  }

  fechaNoPasadaValidator(control: any) {
    const fechaIngresada = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaIngresada < hoy ? { fechaInvalida: true } : null;
  }

  get objetivosFormArray() {
    return this.suscripcionForm.get('objetivos') as FormArray;
  }

  onSubmit() {
    if (this.suscripcionForm.valid) {
      const objetivosSeleccionados = this.suscripcionForm.value.objetivos
        .map((checked: boolean, i: number) => checked ? this.objetivos[i] : null)
        .filter((v: string | null) => v !== null);

      const datosFormulario = {
        ...this.suscripcionForm.value,
        objetivos: objetivosSeleccionados
      };

      this.clienteService.registrarInscripcionCompleta(datosFormulario).subscribe({
        // 🟢 CORRECCIÓN TS7006: Se añade : any al parámetro response
        next: (response: any) => { 
          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: response.mensaje || 'Tu suscripción ha sido registrada correctamente.'
          });
          this.suscripcionForm.reset();
        },
        // 🟢 CORRECCIÓN TS7006: Se añade : any al parámetro err
        error: (err: any) => { 
          console.error('Error de inscripción:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error de registro',
            text: err.error?.error || 'Ocurrió un error inesperado al procesar la inscripción.'
          });
        }
      });
    }

  }

  fechaRangoValida(control: AbstractControl): ValidationErrors | null {
    const fechaSeleccionada = new Date(control.value);
    const hoy = new Date();
    const maxFecha = new Date();
    maxFecha.setDate(hoy.getDate() + 10);

    if (isNaN(fechaSeleccionada.getTime())) return null; 

    if (fechaSeleccionada < hoy) {
      return { fechaInvalida: true };
    }

    if (fechaSeleccionada > maxFecha) {
      return { fechaFueraDeRango: true };
    }

    return null;
  }

  videoEstilos = {
    backgroundColor: '#f4faff',
    padding: '10px',
    borderRadius: '15px'
  };
}
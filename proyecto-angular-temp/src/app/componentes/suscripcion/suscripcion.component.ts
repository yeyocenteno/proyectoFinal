import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { PlanesComponent } from '../planes/planes.component';
import { DomseguroPipe } from '../domseguro.pipe';

@Component({
  selector: 'app-suscripcion',
  imports: [CommonModule,ReactiveFormsModule,PlanesComponent,DomseguroPipe],
  templateUrl: './suscripcion.component.html',
  styleUrl: './suscripcion.component.css'
})
export class SuscripcionComponent {
  suscripcionForm: FormGroup;
  planes = ['Básico', 'Intermedio', 'Avanzado'];
  objetivos = ['Perder peso', 'Ganar masa muscular', 'Mantener condición'];
  editando = false;
  hovering = false;
  video:string="I_RYujJvZ7s"; // videoo

indiceEditando = -1;

  constructor(private fb: FormBuilder) {
    const fechaMinima = new Date();
    this.suscripcionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: [
        '',
        [Validators.required, Validators.email],
      ],
      fecha: ['', [Validators.required, this.fechaNoPasadaValidator,this.fechaRangoValida]],
      plan: ['', Validators.required],
      objetivos: this.buildObjetivos(),
      genero: ['', Validators.required],
    });
  }

ngOnInit() {
  const registro = localStorage.getItem('registroEditando');
  if (registro) {
    const { tipo, index } = JSON.parse(registro);
    if (tipo === 'suscripcion') {
      const suscripciones = JSON.parse(localStorage.getItem('suscripciones') || '[]');
      const datos = suscripciones[index];
      if (datos) {
        this.editando = true;
        this.indiceEditando = index;
        this.suscripcionForm.patchValue({
          nombre: datos.nombre,
          correo: datos.correo,
          fecha: datos.fecha,
          plan: datos.plan,
          genero: datos.genero
        });

        // Setear checkboxes de objetivos:
        datos.objetivos.forEach((valor: boolean, i: number) => {
          (this.objetivosFormArray.at(i) as any).setValue(valor);
        });
      }
    }
  }
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
    const suscripciones = JSON.parse(localStorage.getItem('suscripciones') || '[]');
    if (this.editando && this.indiceEditando > -1) {
      suscripciones[this.indiceEditando] = this.suscripcionForm.value;
    } else {
      suscripciones.push(this.suscripcionForm.value);
    }
    localStorage.setItem('suscripciones', JSON.stringify(suscripciones));
    localStorage.removeItem('registroEditando');

    Swal.fire({
      icon: 'success',
      title: this.editando ? '¡Registro actualizado!' : '¡Registro exitoso!',
      text: this.editando
        ? 'La suscripción ha sido actualizada correctamente.'
        : 'Tu suscripción ha sido registrada correctamente.',
    });
    this.suscripcionForm.reset();
    this.editando = false;
    this.indiceEditando = -1;
  }

}


fechaRangoValida(control: AbstractControl): ValidationErrors | null {
  const fechaSeleccionada = new Date(control.value);
  const hoy = new Date();
  const maxFecha = new Date();
  maxFecha.setDate(hoy.getDate() + 10);

  if (isNaN(fechaSeleccionada.getTime())) return null; // si no es una fecha válida

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

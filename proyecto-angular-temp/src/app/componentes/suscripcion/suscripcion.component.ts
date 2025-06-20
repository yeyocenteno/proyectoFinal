import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { PlanesComponent } from '../planes/planes.component';
import { DomseguroPipe } from '../domseguro.pipe';
import { AuthService } from '../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection } from 'firebase/firestore';
import { AfterViewChecked } from '@angular/core';
declare var paypal: any;

@Component({
  selector: 'app-suscripcion',
  imports: [CommonModule,ReactiveFormsModule,PlanesComponent,DomseguroPipe],
  templateUrl: './suscripcion.component.html',
  styleUrl: './suscripcion.component.css'
})
export class SuscripcionComponent implements AfterViewChecked {
  private paypalRendered = false;
  suscripcionForm: FormGroup;
  planes = ['Básico', 'Intermedio', 'Avanzado'];
  objetivos = ['Perder peso', 'Ganar masa muscular', 'Mantener condición'];
  editando = false;
  hovering = false;
  video:string="I_RYujJvZ7s"; // videoo
  currentUserEmail: string | null = null;

indiceEditando = -1;

  constructor(private fb: FormBuilder, private authService: AuthService, private firestore: Firestore) {
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
  this.authService.user$.subscribe(user => {
    this.currentUserEmail = user?.email || null;
  });

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

  ngAfterViewChecked(): void {
    const isVisible = this.suscripcionForm.valid && this.currentUserEmail;
    const container = document.getElementById('paypal-button-container');

    if (isVisible && container && !this.paypalRendered) {
      this.renderPayPalButton();
      this.paypalRendered = true;
    }
  }
  
renderPayPalButton() {
  const container = document.getElementById('paypal-button-container');
  if (!paypal || !container) {
    console.error('PayPal SDK no cargado o contenedor no encontrado');
    return;
  }

  container.innerHTML = ''; // Limpia botón anterior si hay

  paypal.Buttons({
    style: {
      shape: "pill",
      layout: "vertical",
      color: "gold",
      label: "paypal"
    },
    createOrder: (data: any, actions: any) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: "10.00" // cambia esto al monto de tu suscripción
          }
        }]
      });
    },
    onApprove: async (data: any, actions: any) => {
      const details = await actions.order.capture();
      console.log("Pago completado:", details);

      // Aquí puedes guardar en Firebase o mostrar SweetAlert:
      Swal.fire({
        icon: 'success',
        title: 'Pago exitoso',
        text: `Transacción ${details.status}: ${details.id}`
      });
    },
    onError: (err: any) => {
      console.error('Error en el pago:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al procesar el pago.'
      });
    }
  }).render('#paypal-button-container');
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
async onSubmit() {
  console.log('submit!'); // <-- para debug
  if (!this.currentUserEmail) {
    Swal.fire({
      icon: 'warning',
      title: 'Acceso denegado',
      text: 'Debes iniciar sesión para enviar el formulario.'
    });
    return;
  }

  if (this.suscripcionForm.valid) {
    try {
      const data = {
        ...this.suscripcionForm.value,
        emailUsuario: this.currentUserEmail,
        fechaRegistro: new Date()
      };

      const suscripcionesRef = collection(this.firestore, 'suscripciones');
      await addDoc(suscripcionesRef, data);

      Swal.fire({
        icon: 'success',
        title: this.editando ? '¡Registro actualizado!' : '¡Registro exitoso!',
        text: this.editando
          ? 'La suscripción ha sido actualizada correctamente.'
          : 'Tu suscripción ha sido registrada correctamente.'
      });

      this.suscripcionForm.reset();
      this.editando = false;
      this.indiceEditando = -1;

    } catch (error) {
      console.error('Error al guardar en Firestore', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar la suscripción. Inténtalo de nuevo.'
      });
    }
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

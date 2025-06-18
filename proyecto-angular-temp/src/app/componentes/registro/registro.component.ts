import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private firestore: Firestore) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d_]{6,12}$/)
      ]],
      confirmarContrasena: ['', Validators.required]
    }, { validators: this.contrasenasCoinciden });
  }

  contrasenasCoinciden(group: FormGroup) {
    const pass = group.get('contrasena')?.value;
    const confirm = group.get('confirmarContrasena')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  async registrarUsuario() {
    if (this.registroForm.invalid) {
      Swal.fire('Error', 'Revisa los campos del formulario.', 'error');
      return;
    }

    const { nombre, correo, contrasena } = this.registroForm.value;

    try {
      const userCredential = await this.authService.registrar(correo, contrasena);
      const uid = userCredential.user.uid;

      // Guardamos nombre en Firestore
      const usersCollection = collection(this.firestore, 'usuarios');
      await addDoc(usersCollection, { uid, nombre, correo });

      Swal.fire('¡Registro exitoso!', 'Tu cuenta ha sido creada.', 'success');
      this.registroForm.reset();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }
}

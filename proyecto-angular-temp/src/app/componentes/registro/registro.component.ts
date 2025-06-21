import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registroForm: FormGroup;
  selectedImage: File | null = null;

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

    let photoURL = 'assets/profile-placeholder.jpg'; // Imagen predeterminada

    // Si se subió imagen, subirla a Firebase Storage
    if (this.selectedImage) {
      const storage = getStorage();
      const storageRef = ref(storage, `usuarios/${uid}/perfil.jpg`);
      await uploadBytes(storageRef, this.selectedImage);
      photoURL = await getDownloadURL(storageRef); // Obtenemos URL pública
    }

    // Guardamos datos en Firestore con imagen incluida
    const usersCollection = collection(this.firestore, 'usuarios');
    await addDoc(usersCollection, {
      uid,
      nombre,
      correo,
      photoURL
    });

    Swal.fire('¡Registro exitoso!', 'Tu cuenta ha sido creada.', 'success');
    this.registroForm.reset();
    this.selectedImage = null;

  } catch (error: any) {
    Swal.fire('Error', error.message, 'error');
  }
}


  onFileSelected(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  if (fileInput.files && fileInput.files.length > 0) {
    this.selectedImage = fileInput.files[0];
  }
}
}

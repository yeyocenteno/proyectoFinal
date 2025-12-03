import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registroForm: FormGroup;
  selectedImage: File | null = null;

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d_]{6,12}$/)
      ]],
      confirmarContrasena: ['', Validators.required],
      rol: ['usuario', Validators.required],
      genero: ['otro', Validators.required], // Campo nuevo opcional en formulario
      edad: [''],   // Si quieres validar edad, agregar Validators
      telefono: [''],
      direccion: ['']
    }, { validators: this.contrasenasCoinciden });
  }

  contrasenasCoinciden(group: FormGroup) {
    const pass = group.get('contrasena')?.value;
    const confirm = group.get('confirmarContrasena')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  registrarUsuario() {
    if (this.registroForm.invalid) {
      Swal.fire('Error', 'Revisa los campos del formulario.', 'error');
      return;
    }

    const { nombre, correo, contrasena, rol, genero, edad, telefono, direccion } = this.registroForm.value;

    const clienteData = {
      nombre,
      correo,
      genero,
      edad,
      telefono,
      direccion,
      rol,
      contrasena
    };

    this.clienteService.crearCliente(clienteData).subscribe({
      next: (res) => {
        Swal.fire('¡Registro exitoso!', 'Tu cuenta ha sido creada.', 'success');
        this.registroForm.reset();
        this.selectedImage = null;
      },
      error: (err) => {
        // Manejo de correo duplicado
        if (err.error?.code === '23505') {
          Swal.fire('Error', 'El correo ya está registrado.', 'error');
        } else {
          Swal.fire('Error', 'Ocurrió un error en el registro.', 'error');
          console.error('Error al registrar cliente:', err);
        }
      }
    });
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedImage = fileInput.files[0];
    }
  }
}

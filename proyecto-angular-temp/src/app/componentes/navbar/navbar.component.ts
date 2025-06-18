import { Component } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { RegistroComponent } from '../registro/registro.component';
declare var bootstrap: any;
@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [MatButtonModule,MatMenuModule,RouterModule,CommonModule,FormsModule,RegistroComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  loginForm = { email: '', password: '' };
  loginError = false;
  currentUser: User | null = null;
  mostrarRegistro = false;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  alternarVistaRegistro() {
    this.mostrarRegistro = !this.mostrarRegistro;
  }

  login() {
    const { email, password } = this.loginForm;
    this.authService.login(email, password)
      .then(result => {
        Swal.fire({
          icon: 'success',
          title: '¡Inicio de sesión exitoso!',
          text: `Bienvenido, ${result.user.email}`
        }).then(() => {
          const modalElement = document.getElementById('adminLoginModal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }
        });
        this.loginError = false;
      })
      .catch(error => {
        this.loginError = true;
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: error.message
        });
      });
  }

  logout() {
    this.authService.logout().then(() => {
      Swal.fire('Sesión cerrada', 'Has cerrado sesión exitosamente.', 'info');
    });
  }
}

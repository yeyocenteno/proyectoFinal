import { Component } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;
@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [MatButtonModule,MatMenuModule,RouterModule,CommonModule,FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  admin = { username: '', password: '' };
  currentAdmin: { username: string, nombre: string } | null = null;
  loginError = false;

  validAdmins = [
    { username: 'admin1', password: 'admin123', nombre: 'Jaime López' },
    { username: 'admin2', password: 'clave456', nombre: 'Ricardo Almada' },
    { username: 'entrenador', password: 'fit789', nombre: 'Diego Saldaña' }
  ];

  login() {
    const found = this.validAdmins.find(
      user => user.username === this.admin.username && user.password === this.admin.password
    );

    if (found) {
      this.currentAdmin = { username: found.username, nombre: found.nombre };
      this.loginError = false;

      Swal.fire({
        icon: 'success',
        title: '¡Inicio de sesión exitoso!',
        text: `Bienvenido, ${found.nombre}`
      }).then(() => {
        const modalElement = document.getElementById('adminLoginModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
        }
      });
    } else {
      this.loginError = true;
    }
  }

  logout() {
    this.currentAdmin = null;
    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      text: 'Has cerrado la sesión exitosamente.'
    });
  }
}

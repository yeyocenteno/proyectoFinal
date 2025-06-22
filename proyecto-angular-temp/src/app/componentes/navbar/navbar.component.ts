import { Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { RegistroComponent } from '../registro/registro.component';
import { StorageComponent } from '../storage/storage.component';
import { doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, RouterModule, CommonModule, FormsModule, RegistroComponent, StorageComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  currentUser: User | null = null;
  loginForm = { email: '', password: '' };
  loginError = false;
  mostrarRegistro = false;
  mostrarPanel = false;
  sintesis = window.speechSynthesis;
  voz = new SpeechSynthesisUtterance();
  mainText = '';
  modoContraste = false;
  deferredPrompt: any;
  showInstallButton = false;
  fotoPerfilURL = 'assets/profile-placeholder.jpg';
  fotoPerfil: string = 'assets/profile-placeholder.jpg';
  mostrarComponenteStorage = false;
  rolUsuario: string = ''; // <-- NUEVO: rol del usuario (admin o user)
  tamanoFuente: number = 100;

  constructor(private authService: AuthService, private firestore: Firestore, private router: Router) {
  this.authService.user$.subscribe(user => {
    this.currentUser = user;
  });
}


  admin: boolean = false;

  ngOnInit(): void {
    this.authService.user$.subscribe(async (user) => {
      this.currentUser = user;

      if (user) {
        const docRef = doc(this.firestore, `usuarios/${user.uid}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          this.admin = data.rol === 'admin'; // 🔴 Verifica si es admin
          if (data.photoURL) {
            this.fotoPerfil = data.photoURL;
          }
        }
      }
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton = true;
    });
  }

  actualizarFotoPerfil(nuevaFoto: string) {
    this.fotoPerfil = nuevaFoto;
    this.mostrarComponenteStorage = false;
  }

  instalarApp() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      this.deferredPrompt = null;
      this.showInstallButton = false;
    });
  }

  alternarVistaRegistro() {
    this.mostrarRegistro = !this.mostrarRegistro;
  }



  login() {
    const captchaResponse = (window as any).grecaptcha?.getResponse();

    if (!captchaResponse) {
      Swal.fire({
        icon: 'warning',
        title: 'Verificación requerida',
        text: 'Por favor, resuelve el CAPTCHA antes de iniciar sesión.'
      });
      return;
    }

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
          (window as any).grecaptcha?.reset();
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
        (window as any).grecaptcha?.reset();
      });
  }

  get username(): string {
    if (!this.currentUser || !this.currentUser.email) return '';
    return this.currentUser.email.split('@')[0];
  }

  logout() {
  this.authService.logout().then(() => {
    Swal.fire('Sesión cerrada', 'Has cerrado sesión exitosamente.', 'info').then(() => {
      this.router.navigate(['/']); //  Redirige al inicio
    });
  });
}


  togglePanel() {
    this.mostrarPanel = !this.mostrarPanel;
  }

  iniciarLectura() {
    const texto = document.body.innerText;
    const mensaje = new SpeechSynthesisUtterance(texto);
    speechSynthesis.speak(mensaje);
  }

  pausarLectura() {
    this.sintesis.pause();
  }

  detenerLectura() {
    this.sintesis.cancel();
  }

  toggleContraste() {
    this.modoContraste = !this.modoContraste;
    const body = document.body;

    if (this.modoContraste) {
      body.classList.add('modo-contraste');
    } else {
      body.classList.remove('modo-contraste');
    }
  }

  cambiarTamanoTexto() {
    document.body.style.fontSize = `${this.tamanoFuente}%`;
  }

  cambiarFuente(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const valor = selectElement.value;
    document.body.style.fontFamily = valor;
  }

  abrirSubirFoto() {
    const modalEl = document.getElementById('storageModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}


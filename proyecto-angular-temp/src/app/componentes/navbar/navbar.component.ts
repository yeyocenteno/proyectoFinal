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
import { StorageComponent } from '../storage/storage.component';
import { doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
declare var bootstrap: any;
@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [MatButtonModule,MatMenuModule,RouterModule,CommonModule,FormsModule,RegistroComponent, StorageComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  // Propiedades del componente
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
  fotoPerfil: string = 'assets/profile-placeholder.jpg'; // por defecto
mostrarComponenteStorage = false;
  
  // Constructor que inyecta el servicio de autenticación
  constructor(private authService: AuthService, private firestore: Firestore) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.authService.user$.subscribe(async (user) => {
    this.currentUser = user;

    if (user) {
      const docRef = doc(this.firestore, `usuarios/${user.uid}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        if (data.fotoPerfil) {
          this.fotoPerfilURL = data.fotoPerfil;
        }
      }
    }
  });
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // Evitar que el navegador muestre el prompt por defecto
      this.deferredPrompt = e; // Guardar el evento para lanzarlo luego
      this.showInstallButton = true; // Mostrar botón de instalación en UI
    });
  }

  actualizarFotoPerfil(nuevaFoto: string) {
  this.fotoPerfil = nuevaFoto;
  this.mostrarComponenteStorage = false;
}

  instalarApp() {
    if (!this.deferredPrompt) {
      return;
    }
    this.deferredPrompt.prompt(); // Mostrar prompt de instalación
    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario aceptó la instalación');
      } else {
        console.log('Usuario rechazó la instalación');
      }
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
    return; // detiene el login si no se resolvió captcha
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
        // Reinicia el captcha para la próxima vez
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
      // Reinicia el captcha para que pueda intentar otra vez
      (window as any).grecaptcha?.reset();
    });
}

  get username(): string {
  if (!this.currentUser || !this.currentUser.email) return '';
  return this.currentUser.email.split('@')[0];
}


  logout() {
    this.authService.logout().then(() => {
      Swal.fire('Sesión cerrada', 'Has cerrado sesión exitosamente.', 'info');
    });
  }

  togglePanel() {
  this.mostrarPanel = !this.mostrarPanel;
}

iniciarLectura() {
  const texto = document.body.innerText; // o un selector específico como .contenido-principal
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
    console.log('Activando modo contraste');
    body.classList.add('modo-contraste');
  } else {
    body.classList.remove('modo-contraste');
  }
}

  tamanoFuente: number = 100;

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

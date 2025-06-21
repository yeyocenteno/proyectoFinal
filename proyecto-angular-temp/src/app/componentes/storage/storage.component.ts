import { Component, EventEmitter, Output } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-storage',
  imports: [],
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.css'
})
export class StorageComponent {
  @Output() fotoSeleccionada = new EventEmitter<string>();
  selectedFile: File | null = null;
  constructor(private storageService: StorageService, private authService: AuthService, private firestore: Firestore, private auth: Auth) {}

  async subirFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const archivo = input.files[0];
    const user = await this.authService.getCurrentUser2(); // o como tengas el usuario logueado

    if (!user?.uid) return;

    try {
      const urlFoto = await this.storageService.subirFotoPerfil(user.uid, archivo);

      // Guarda la url en Firestore o en perfil Firebase Auth
      await this.authService.actualizarFotoPerfil(urlFoto);

      alert('Foto subida y perfil actualizado');
    } catch (error) {
      console.error('Error subiendo foto:', error);
      alert('Error al subir foto');
    }
  }
onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  }
}

uploadFile() {
  if (!this.selectedFile) return;

  const reader = new FileReader();
  reader.onload = () => {
    const imageUrl = reader.result as string;

    // Envía la imagen al navbar para mostrarla temporalmente
    this.fotoSeleccionada.emit(imageUrl);
  };

  reader.readAsDataURL(this.selectedFile);
}

}

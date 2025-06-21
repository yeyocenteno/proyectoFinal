import { Injectable } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: Storage) {}
    // Sube archivo y retorna URL de descarga
    async subirFotoPerfil(uid: string, archivo: File): Promise<string> {
    const archivoRef = ref(this.storage, `profile_pics/${uid}/${archivo.name}`);
    const snapshot = await uploadBytes(archivoRef, archivo);
    return await getDownloadURL(snapshot.ref);
  }
}

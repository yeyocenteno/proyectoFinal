import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, FacebookAuthProvider, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User, UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
    currentUserValue: any;

  constructor(private auth: Auth, private firestore: Firestore, private storage: Storage, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  async register(email: string, password: string, displayName: string, imageFile?: File): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    let photoURL = 'assets/profile-placeholder.jpg'; // Imagen por defecto

    // Si se sube una imagen
    if (imageFile) {
      const filePath = `profilePictures/${user.uid}`;
      const imageRef = ref(this.storage, filePath);
      await uploadBytes(imageRef, imageFile);
      photoURL = await getDownloadURL(imageRef);
    }

    // Actualizar perfil
    await updateProfile(user, {
      displayName,
      photoURL
    });

    // Guardar también en Firestore si lo deseas
    await setDoc(doc(this.firestore, 'users', user.uid), {
      email,
      displayName,
      photoURL
    });

    this.userSubject.next(user);
  }

  registrar(correo: string, contrasena: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, correo, contrasena);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  async getCurrentUser2(): Promise<User | null> {
    const auth = getAuth();
    return auth.currentUser;
  }

  async actualizarFotoPerfil(url: string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { photoURL: url });
    }
  }

  loginConGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(result => {
        Swal.fire('Bienvenido', result.user.displayName || '', 'success');
        this.router.navigate(['/']); // o donde desees redirigir
      })
      .catch(error => {
        Swal.fire('Error', error.message, 'error');
      });
  }

  loginConFacebook() {
    const provider = new FacebookAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(result => {
        Swal.fire('Bienvenido', result.user.displayName || '', 'success');
        this.router.navigate(['/']);
      })
      .catch(error => {
        Swal.fire('Error', error.message, 'error');
      });
  }

  
}

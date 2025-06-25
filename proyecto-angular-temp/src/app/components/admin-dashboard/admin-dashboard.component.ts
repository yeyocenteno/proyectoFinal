import { Component, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collectionData } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { EmailComponent } from '../../componentes/email/email.component';
import { GraficaComponent } from '../../componentes/grafica/grafica.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, EmailComponent, GraficaComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  firestore = inject(Firestore);
  datos: any[] = [];
  editando: any = null;

  constructor() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const snapshot = await getDocs(usuariosRef);
    this.datos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async eliminarUsuario(id: string) {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al usuario',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    });

    if (confirmacion.isConfirmed) {
      const userDoc = doc(this.firestore, `usuarios/${id}`);
      await deleteDoc(userDoc);
      Swal.fire('Eliminado', 'El usuario fue eliminado.', 'success');
      this.cargarUsuarios(); // Refrescar
    }
  }

  iniciarEdicion(usuario: any) {
    this.editando = { ...usuario };
  }

  async guardarCambios() {
    if (!this.editando?.id) return;

    const userDoc = doc(this.firestore, `usuarios/${this.editando.id}`);
    await updateDoc(userDoc, {
      nombre: this.editando.nombre,
      correo: this.editando.correo
    });

    this.editando = null;
    Swal.fire('Actualizado', 'Los datos fueron actualizados.', 'success');
    this.cargarUsuarios(); // Refrescar
  }

  cancelarEdicion() {
    this.editando = null;
  }
}

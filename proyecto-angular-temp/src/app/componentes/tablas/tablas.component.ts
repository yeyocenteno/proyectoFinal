import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { EquipoService, Integrante } from '../equipo.service';
import { Router } from '@angular/router';
import { AdminDashboardComponent } from '../../components/admin-dashboard/admin-dashboard.component';
import { GraficaComponent } from '../grafica/grafica.component';
import { collection, deleteDoc, doc, Firestore, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import { collectionData, provideFirestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tablas',
  imports: [CommonModule, FormsModule],
  templateUrl: './tablas.component.html',
  styleUrl: './tablas.component.css'
})
export class TablasComponent {
  firestore = inject(Firestore);

  integrantes: Integrante[] = [];
  suscripciones: any[] = [];
  quejas: any[] = [];

  editandoSuscripcion: any = null;
  editandoQueja: any = null;

  constructor(private equipoService: EquipoService) {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.integrantes = this.equipoService.getIntegrantes();

    // Cargar suscripciones
    const suscripcionesRef = collection(this.firestore, 'suscripcion');
    const susSnapshot = await getDocs(suscripcionesRef);
    this.suscripciones = susSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Cargar quejas
    const quejasRef = collection(this.firestore, 'queja');
    const quejasSnapshot = await getDocs(quejasRef);
    this.quejas = quejasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // --------- Suscripciones ---------
  async eliminarSuscripcion(id: string) {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la suscripción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    });

    if (confirmacion.isConfirmed) {
      const docRef = doc(this.firestore, `suscripcion/${id}`);
      await deleteDoc(docRef);
      Swal.fire('Eliminado', 'La suscripción ha sido eliminada.', 'success');
      this.cargarDatos();
    }
  }

  iniciarEdicionSuscripcion(suscripcion: any) {
    this.editandoSuscripcion = { ...suscripcion };
  }

  async guardarCambiosSuscripcion() {
    if (!this.editandoSuscripcion?.id) return;

    const docRef = doc(this.firestore, `suscripcion/${this.editandoSuscripcion.id}`);
    await updateDoc(docRef, {
      nombre: this.editandoSuscripcion.nombre,
      correo: this.editandoSuscripcion.correo,
      fecha: this.editandoSuscripcion.fecha,
      plan: this.editandoSuscripcion.plan,
      objetivos: this.editandoSuscripcion.objetivos,
      genero: this.editandoSuscripcion.genero
    });

    this.editandoSuscripcion = null;
    Swal.fire('Actualizado', 'Los datos de la suscripción fueron actualizados.', 'success');
    this.cargarDatos();
  }

  cancelarEdicionSuscripcion() {
    this.editandoSuscripcion = null;
  }

  // --------- Quejas ---------
  async eliminarQueja(id: string) {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar queja?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar'
    });

    if (confirmacion.isConfirmed) {
      const docRef = doc(this.firestore, `queja/${id}`);
      await deleteDoc(docRef);
      Swal.fire('Eliminada', 'La queja ha sido eliminada.', 'success');
      this.cargarDatos();
    }
  }

  iniciarEdicionQueja(queja: any) {
    this.editandoQueja = { ...queja };
  }

  async guardarCambiosQueja() {
    if (!this.editandoQueja?.id) return;

    const docRef = doc(this.firestore, `queja/${this.editandoQueja.id}`);
    await updateDoc(docRef, {
      nombre: this.editandoQueja.nombre,
      correo: this.editandoQueja.correo,
      motivo: this.editandoQueja.motivo,
      fecha: this.editandoQueja.fecha,
      opciones: this.editandoQueja.opciones,
      gravedad: this.editandoQueja.gravedad
    });

    this.editandoQueja = null;
    Swal.fire('Actualizado', 'Los datos de la queja fueron actualizados.', 'success');
    this.cargarDatos();
  }

  cancelarEdicionQueja() {
    this.editandoQueja = null;
  }
}
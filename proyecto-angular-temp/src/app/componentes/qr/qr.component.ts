import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { QRCodeComponent } from 'angularx-qrcode';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [CommonModule, HttpClientModule, QRCodeComponent],
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.css']
})
export class QrComponent {
  qrData: string | null = null;
  currentUserUid: string | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserUid = user.uid;
        this.getData(this.currentUserUid); // Generar QR al iniciar con UID real
      }
    });
  }
  // Llama esta función desde el HTML o en ngOnInit
  getData(uid: string) {
    this.http.get<{ nombre: string; plan: string; fecha: string }>(
      `http://localhost:3000/api/suscripcion/${uid}`
    ).subscribe({
      next: data => this.generateQRCode(data),
      error: err => console.error('Error al obtener suscripción:', err)
    });
  }

  generateQRCode(data: { nombre: string; plan: string; fecha: string }) {
    const payload = {
      nombre: data.nombre,
      plan: data.plan,
      fecha: data.fecha,
      generadoEn: new Date().toISOString()
    };
    this.qrData = JSON.stringify(payload);
  }
}

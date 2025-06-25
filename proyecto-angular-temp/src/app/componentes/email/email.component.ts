import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-email',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './email.component.html',
  styleUrl: './email.component.css'
})
export class EmailComponent {
  email = {
    to: '',
    subject: '',
    message: ''
  };

  constructor(private http: HttpClient) {}

  sendEmail() {
    this.http.post('http://localhost:3001/send-email', this.email)
      .subscribe({
        next: () => alert('Correo enviado'),
        error: (err) => console.error('Error al enviar correo', err)
      });
  }
}

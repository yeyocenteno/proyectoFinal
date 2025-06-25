import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatLabel } from '@angular/material/form-field';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { collection, getDocs, query } from 'firebase/firestore';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-grafica',
  imports: [NgChartsModule],
  templateUrl: './grafica.component.html',
  styleUrl: './grafica.component.css'
})
export class GraficaComponent implements OnInit {
  barChartData: ChartData<'bar'> = {
    labels: ['Básico', 'Intermedio', 'Avanzado'],
    datasets: [
      { data: [0, 0, 0], label: 'Inscritos' }
    ]
  };

  barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  };

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    const planes: Array<keyof typeof counts> = ['Básico', 'Intermedio', 'Avanzado'];
    const counts = { 'Básico': 0, 'Intermedio': 0, 'Avanzado': 0 };

    try {
      const suscripcionesRef = collection(this.firestore, 'suscripciones');
      const q = query(suscripcionesRef);
      const snapshot = await getDocs(q);

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data['plan'] && planes.includes(data['plan'])) {
          counts[data['plan'] as keyof typeof counts]++;
        }
      });

      // Actualizamos los datos del gráfico
      this.barChartData = {
        labels: planes,
        datasets: [
          { data: planes.map(p => counts[p]), label: 'Inscritos' }
        ]
      };

    } catch (error) {
      console.error('Error cargando datos para gráfica:', error);
    }
  }
}

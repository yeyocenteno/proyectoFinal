import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatLabel } from '@angular/material/form-field';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.component.html',
  styleUrl: './grafica.component.css'
})
export class GraficaComponent {
  barChartOptions: ChartOptions = { responsive: true };
  barChartLabels: MatLabel[] = [];
  barChartData: { data: number[]; label: string }[] = [{ data: [], label: 'Planes' }];
  barChartType: ChartType = 'bar';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<{ [key: string]: number }>('http://localhost:3000/api/estadisticas/planes')
      .subscribe(data => {
        this.barChartLabels = Object.keys(data);
        this.barChartData[0].data = Object.values(data);
      });
  }

}

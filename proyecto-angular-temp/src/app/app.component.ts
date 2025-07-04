import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './componentes/footer/footer.component';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { HeaderComponent } from './componentes/header/header.component';
import * as AOS from 'aos';
import { EmailComponent } from './componentes/email/email.component';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent,NavbarComponent, NgChartsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'proyecto-angular-temp';
  qrData: string;

  constructor() {
    this.qrData = 'Datos dinámicos aquí';
  }
  ngOnInit() {
    AOS.init();
  }
}

import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './componentes/footer/footer.component';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { HeaderComponent } from './componentes/header/header.component';
import * as AOS from 'aos';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent,NavbarComponent,HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'proyecto-angular-temp';

  ngOnInit() {
    AOS.init();
  }
}

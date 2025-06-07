
import { OfertadepComponent } from '../ofertadep/ofertadep.component';
import { GaleriaComponent } from '../galeria/galeria.component';
import { UbicacionComponent } from '../ubicacion/ubicacion.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [GaleriaComponent,OfertadepComponent,UbicacionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
}
import { Component } from '@angular/core';

@Component({
  selector: 'app-planes',
  imports: [],
  templateUrl: './planes.component.html',
  styleUrl: './planes.component.css'
})
export class PlanesComponent {
  planBasico = [
  { icon: 'assets/check.png', text: 'Acceso libre en horario regular' },
  { icon: 'assets/check.png', text: 'Rutinas guiadas para principiantes' },
  { icon: 'assets/check.png', text: '1 asesoría mensual con entrenador' },
  { icon: 'assets/check.png', text: 'Acceso a 2 cursos grupales' },
  { icon: 'assets/check.png', text: 'Acceso a cualquier instalación de la sucursal' },
  { icon: 'assets/check.png', text: 'Plan nutricional general' },
  { icon: 'assets/cancel.png', text: 'Descuentos en alimentos y bebidas' },
  { icon: 'assets/cancel.png', text: 'Acceso VIP: zona de descanso, sauna, masajes' },
  { icon: 'assets/cancel.png', text: 'Invitaciones a eventos y torneos' },
];

planIntermedio = [
  { icon: 'assets/check.png', text: 'Acceso libre en horario extendido' },
  { icon: 'assets/check.png', text: 'Rutinas personalizadas mensuales' },
  { icon: 'assets/check.png', text: '2 asesorías mensuales con entrenador' },
  { icon: 'assets/check.png', text: 'Acceso a 3 cursos grupales' },
  { icon: 'assets/check.png', text: 'Evaluación de progreso bimestral' },
  { icon: 'assets/check.png', text: 'Plan nutricional personalizado' },
  { icon: 'assets/check.png', text: 'Descuentos en alimentos y bebidas' },
  { icon: 'assets/cancel.png', text: 'Acceso VIP: zona de descanso, sauna, masajes' },
  { icon: 'assets/cancel.png', text: 'Invitaciones a eventos y torneos' },
];

planAvanzado = [
  { icon: 'assets/check.png', text: 'Acceso ilimitado al gimnasio' },
  { icon: 'assets/check.png', text: 'Rutinas avanzadas cada 15 días' },
  { icon: 'assets/check.png', text: '4 sesiones mensuales con entrenador' },
  { icon: 'assets/check.png', text: 'Acceso a 5 cursos grupales' },
  { icon: 'assets/check.png', text: 'Evaluación física mensual' },
  { icon: 'assets/check.png', text: 'Plan nutricional específico' },
  { icon: 'assets/check.png', text: 'Descuentos en alimentos y bebidas' },
  { icon: 'assets/check.png', text: 'Acceso VIP: sauna, masajes, descanso' },
  { icon: 'assets/check.png', text: 'Invitaciones a eventos y torneos' },
];

}

import { Routes } from '@angular/router';
import { SuscripcionComponent } from './componentes/suscripcion/suscripcion.component';
import { HomeComponent } from './componentes/home/home.component';
import { NosotrosComponent } from './componentes/nosotros/nosotros.component';
import { CursoComponent } from './componentes/curso/curso.component';
import { TablasComponent } from './componentes/tablas/tablas.component';
import { CursoDetalleComponent } from './componentes/curso-detalle/curso-detalle.component';
import { StorageComponent } from './componentes/storage/storage.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';


export const routes: Routes = [
  { path: '', component: HomeComponent }, 
 { path: 'curso/:id', component: CursoDetalleComponent},
  { path: 'curso', component: CursoComponent},
  { path: 'nosotros', component: NosotrosComponent},
  { path: 'suscripcion', component: SuscripcionComponent },
  { path: 'tablas', component: TablasComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
  
];

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intensidad'
})
export class IntensidadPipe implements PipeTransform {

  transform(value: string): string {
    switch(value.toLowerCase()) {
      case 'baja':
        return 'green';      // verde para baja intensidad
      case 'media':
        return 'orange';     // naranja para media intensidad
      case 'alta':
        return 'red';        // rojo para alta intensidad
      default:
        return 'gray';       // gris para desconocido o vacío
    }
  }

}

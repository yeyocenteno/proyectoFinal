import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [FormsModule,MatFormFieldModule, MatInputModule, CommonModule],
  templateUrl: './busqueda.component.html',
  styleUrl: './busqueda.component.css'
})
export class BusquedaComponent {
  @Output() searchChanged = new EventEmitter<string>();

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChanged.emit(input.value);
  }
}

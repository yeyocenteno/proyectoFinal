import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
   images = [
    'assets/4.jpg',
    'assets/2.jpg',
    'assets/3.jpg',
    'assets/1.jpg',
  ];
}

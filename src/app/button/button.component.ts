import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../shared/interfaces/button.interface'; 

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() config!: Button; // decorador indica que el componente puede recibir un objeto llamado config desde su componente padre
  @Output() modoChange = new EventEmitter<{modo: string, activo: boolean}>(); // decorador que define un evento llamado modoChange

  // método que llama cuando el componente quiere cambiar el estado de su propiedad activo
  toggle() {
    this.config.activo = !this.config.activo; // se está invirtiendo el valor de la propiedad activo de config
    this.modoChange.emit({
      modo: this.config.modo,
      activo: this.config.activo
    });
  }
}
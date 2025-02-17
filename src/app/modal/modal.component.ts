// components/modal-generico.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal, ResultadoModal } from '../shared/interfaces/modal.interface';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() mostrar = false;
  @Input() config!: Modal;
  @Output() resultado = new EventEmitter<{tipo: string, datos: ResultadoModal}>();

  accionBoton(tipo: string) {
    const datos: ResultadoModal = {};
    this.config.campos.forEach(campo => {
      datos[campo.id] = campo.valor;
    });
    this.resultado.emit({ tipo, datos });
  }
}
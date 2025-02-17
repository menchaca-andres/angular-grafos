import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component'; 
import { Button } from '../shared/interfaces/button.interface';
import { Modal, ResultadoModal } from '../shared/interfaces/modal.interface';
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-mycanvas',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent],
  templateUrl: './mycanvas.component.html',
  styleUrls: ['./mycanvas.component.scss']
})
export class MycanvasComponent {
  modoConexion: boolean = false; // booleano que indica si el modo de conexión está activado o no
  private contador: number = 0; // contador de nodos
  private nodos: { x: number, y: number, radio: number, contador: number, selected: boolean }[] = []; // array de nodos
  private conexiones: { desde: number, hasta: number, peso: number, dirigido: boolean }[] = []; // array de conexiones
  private primerNodoSeleccionado: number | null = null; // guarda el identificador del primer nodo seleccionado para conectar, inicialmente es null
  private segundoNodoSeleccionado: number | null = null;
  mostrarModal = false;
  modals: Modal = {
    titulo: 'Configurar Conexión',
    campos: [
      {
        tipo: 'number',
        id: 'peso',
        label: 'Peso de la conexión:',
        valor: 1
      },
      {
        tipo: 'checkbox',
        id: 'dirigido',
        label: 'Conexión dirigida',
        valor: false
      }
    ],
    botones: [
      {
        texto: 'Confirmar',
        tipo: 'confirmar',
        colorFondo: '#4CAF50',
        colorTexto: 'white'
      },
      {
        texto: 'Cancelar',
        tipo: 'cancelar',
        colorFondo: '#f44336',
        colorTexto: 'white'
      }
    ]
  };
  buttons = {
    conexion: {
      texto: 'Activar Conexión',
      colorActivo: '#ff9800',
      colorInactivo: '#4CAF50',
      modo: 'conexion',
      activo: false
    } as Button,
    eliminacion: {
      texto: 'Activar Eliminación',
      colorActivo: '#f44336',
      colorInactivo: '#4CAF50',
      modo: 'eliminacion',
      activo: false
    } as Button
  };
  // método para cambiar el estado de modoConexion
  toggleModo(event: {modo: string, activo: boolean}): void {
    // desactivar todos los modos primero
    Object.values(this.buttons).forEach(config => {
      config.activo = false;
      if (config.modo === 'conexion') {
        config.texto = 'Activar Conexión';
      } else if (config.modo === 'eliminacion') {
        config.texto = 'Activar Eliminación';
      }
    });
    const configSeleccionado = this.buttons[event.modo as keyof typeof this.buttons]; // obtenemos la configuración del botón seleccionado
    // activa o desactiva el botón seleccionado según el valor de activo en el evento
    configSeleccionado.activo = event.activo;
    configSeleccionado.texto = event.activo ? 
      `Desactivar ${configSeleccionado.modo === 'conexion' ? 'Conexión' : 'Eliminación'}` : 
      `Activar ${configSeleccionado.modo === 'conexion' ? 'Conexión' : 'Eliminación'}`;
    this.nodos.forEach(c => c.selected = false); // desmarca todos los nodos, estableciendo su propiedad selected a false
    this.primerNodoSeleccionado = null; // restablece la variable primerNodoSeleccionado a null
    // redibujar canvas
    const canvas = document.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      this.dibujarNodo(ctx);
    }
  }
  // método de doble clic en el canvas
  dobleClickCanvas(event: MouseEvent): void {
    const canvas = <HTMLCanvasElement>event.target; // obtiene el elemento del lienzo donde se realizó el clic. event.target
    const ctx = canvas.getContext('2d'); // obtenemos el contexto 2D del lienzo
    // verificamos si el contexto (ctx) se obtuvo correctamente
    if (ctx) {
      const rect = canvas.getBoundingClientRect(); // obtiene el rectángulo delimitador del lienzo
      const x = event.clientX - rect.left; // contiene la coordenada X y se resta respecto a la posición izq. del canvas
      const y = event.clientY - rect.top; // contiene la coordenada Y 
      this.contador++; // incrementamos el contador de nodos
      this.nodos.push({ x, y, radio: 30, contador: this.contador, selected: false }); // crea un nuevo nodo y lo agrega al array circulos
      this.dibujarNodo(ctx); // redibujar el nodo
    }
  }
  // método de un clic sobre el nodo
  clickCanvas(event: MouseEvent): void {
    const canvas = <HTMLCanvasElement>event.target;
    const ctx = canvas.getContext('2d');
    // verificamos si el contexto (ctx) se obtuvo correctamente
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // comprobamos si el botón de conexión está activado
      if (this.buttons.conexion.activo) {
        this.manejarConexion(x, y, ctx); // se llama al método manejarConexion(x, y, ctx)
      } else if (this.buttons.eliminacion.activo) { // comprobamos si el botón de eliminación está activado
        this.manejarEliminacion(x, y, ctx); // se llama al método manejarEliminacion(x, y, ctx)
      }
    }
  }
  // método para manejar las conexiones entre nodos
  private manejarConexion(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    // busca el nodo más cercano al clic
    const nodoSeleccionado = this.nodos.find(nodo =>
      Math.sqrt(Math.pow(x - nodo.x, 2) + Math.pow(y - nodo.y, 2)) <= nodo.radio // fórmula de distancia euclidiana
    );
    // verificamos si nodoSeleccionado no es undefined
    if (nodoSeleccionado) {
      if (this.primerNodoSeleccionado === null) {
        this.primerNodoSeleccionado = nodoSeleccionado.contador;
        nodoSeleccionado.selected = true;
      } else if (this.primerNodoSeleccionado !== nodoSeleccionado.contador) {
        this.segundoNodoSeleccionado = nodoSeleccionado.contador;
        this.mostrarModal = true;
      }
      this.dibujarNodo(ctx); // redibuja los nodos para reflejar la selección visualmente.
    }
  }
  // método para manejar la eliminación de conexiones y nodos
  private manejarEliminacion(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    const nodoIndex = this.nodos.findIndex(circulo => 
      Math.sqrt(Math.pow(x - circulo.x, 2) + Math.pow(y - circulo.y, 2)) <= circulo.radio
    );

    if (nodoIndex !== -1) {
      const nodoEliminado = this.nodos[nodoIndex];
      this.conexiones = this.conexiones.filter(conexion => 
        conexion.desde !== nodoEliminado.contador && conexion.hasta !== nodoEliminado.contador
      );
      this.nodos.splice(nodoIndex, 1);
    } else {
      const conexionIndex = this.conexiones.findIndex(conexion => {
        const desde = this.nodos.find(c => c.contador === conexion.desde);
        const hasta = this.nodos.find(c => c.contador === conexion.hasta);
        if (desde && hasta) {
          return this.estaCercaDeConexion(x, y, desde.x, desde.y, hasta.x, hasta.y, conexion);
        }
        return false;
      });

      if (conexionIndex !== -1) {
        this.conexiones.splice(conexionIndex, 1);
      }
    }
    this.dibujarNodo(ctx);
  }
  private estaCercaDeConexion(x: number, y: number, x1: number, y1: number, x2: number, y2: number, conexion: { desde: number, hasta: number }): boolean {
    const bidireccional = this.conexiones.some(c => c.desde === conexion.hasta && c.hasta === conexion.desde);
    if (bidireccional) {
      const controlX = (x1 + x2) / 2 + (y1 - y2) * 0.3;
      const controlY = (y1 + y2) / 2 + (x2 - x1) * 0.3;
      return this.estaCercaDeCurva(x, y, x1, y1, controlX, controlY, x2, y2);
    }
    return this.estaCercaDeLinea(x, y, x1, y1, x2, y2);
  }
  private estaCercaDeLinea(x: number, y: number, x1: number, y1: number, x2: number, y2: number): boolean {
    // calculamos la distancia entre el punto (x, y) y la línea (x1, y1 → x2, y2)
    const distancia = Math.abs((y2-y1)*x - (x2-x1)*y + x2*y1 - y2*x1) / Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2)); // fórmula de distancia punto-línea, derivada de la ecuación de la recta
    return distancia < 5; // si distancia es menor a 5, esto permite hacer clic cerca de la línea para seleccionarla
  }
  private estaCercaDeCurva(x: number, y: number, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number): boolean {
    for (let t = 0; t <= 1; t += 0.05) {
      const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
      const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
      if (Math.sqrt((px - x) ** 2 + (py - y) ** 2) < 5) {
        return true;
      }
    }
    return false;
  }
  // método para confirmar la conexión
  confirmarConexion(datos: {peso: number, dirigido: boolean}) {
    // verificamos si hay dos nodos seleccionados
    if (this.primerNodoSeleccionado !== null && this.segundoNodoSeleccionado !== null) {
      this.conexiones.push({ // guardamos la conexión en el array de conexiones
        desde: this.primerNodoSeleccionado,
        hasta: this.segundoNodoSeleccionado,
        peso: datos.peso,
        dirigido: datos.dirigido
      });
    }
    this.limpiarSeleccion(); // para restablecer la selección y redibujar el canvas
  }
  // método para cancelar la conexión
  cancelarConexion() {
    this.limpiarSeleccion();
  }
  private limpiarSeleccion() {
    this.nodos.forEach(c => c.selected = false);
    this.primerNodoSeleccionado = null;
    this.segundoNodoSeleccionado = null;
    this.mostrarModal = false;
    
    const canvas = document.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      this.dibujarNodo(ctx);
    }
  }
  // método para manejar el resultado del modal
  manejarResultadoModal(evento: {tipo: string, datos: ResultadoModal}) {
    if (evento.tipo === 'confirmar') {
      this.confirmarConexion({
        peso: evento.datos["peso"],
        dirigido: evento.datos["dirigido"]
      });
    } else {
      this.cancelarConexion();
    }
  }
  // método de dibujar nodo
  dibujarNodo(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Dibujar conexiones
    this.conexiones.forEach(conexion => {
      const desde = this.nodos.find(c => c.contador === conexion.desde);
      const hasta = this.nodos.find(c => c.contador === conexion.hasta);
      if (desde && hasta) {
        const bidireccional = this.conexiones.some(c => c.desde === conexion.hasta && c.hasta === conexion.desde);
        ctx.beginPath();
        let midX, midY, controlX, controlY;
        if (bidireccional) {
          controlX = (desde.x + hasta.x) / 2 + (desde.y - hasta.y) * 0.3;
          controlY = (desde.y + hasta.y) / 2 + (hasta.x - desde.x) * 0.3;
          ctx.moveTo(desde.x, desde.y);
          ctx.quadraticCurveTo(controlX, controlY, hasta.x, hasta.y);
          midX = (desde.x + 2 * controlX + hasta.x) / 4;
          midY = (desde.y + 2 * controlY + hasta.y) / 4;
        } else {
          controlX = (desde.x + hasta.x) / 2;
          controlY = (desde.y + hasta.y) / 2;
          ctx.moveTo(desde.x, desde.y);
          ctx.lineTo(hasta.x, hasta.y);
          midX = controlX;
          midY = controlY;
        }
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (conexion.dirigido) {
          this.dibujarFlechaCurva(ctx, desde.x, desde.y, hasta.x, hasta.y, controlX, controlY);
        }
        // Dibujar peso de cada conexión en su propia posición
        ctx.fillStyle = 'white';
        ctx.fillRect(midX - 10, midY - 10, 20, 20);
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(conexion.peso.toString(), midX, midY);
      }
    });
    // Dibujar nodos
    this.nodos.forEach(circulo => {
      ctx.beginPath();
      ctx.arc(circulo.x, circulo.y, circulo.radio, 0, Math.PI * 2);
      ctx.fillStyle = circulo.selected ? '#ff9800' : 'yellow';
      ctx.fill();
      ctx.stroke();
      ctx.font = '20px Source Sans Pro,Arial,sans-serif';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(circulo.contador.toString(), circulo.x, circulo.y);
    });
  }
  private dibujarFlechaCurva(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, ctrlX: number, ctrlY: number): void {
    const t = 0.9; // Punto cercano al final de la curva
    const x = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * ctrlX + t * t * toX;
    const y = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * ctrlY + t * t * toY;
    const angle = Math.atan2(toY - y, toX - x);
    const headLen = 10;
    ctx.beginPath();
    ctx.moveTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x, y);
    ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
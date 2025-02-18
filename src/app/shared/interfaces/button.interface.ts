export interface Button {
    texto: string;
    colorActivo: string;
    colorInactivo: string;
    modo: 'conexion' | 'eliminacion' | 'mover';
    activo: boolean;
  }
export interface Modal {
    titulo: string;
    campos: CampoModal[];
    botones: BotonModal[];
}

export interface CampoModal {
    tipo: 'number' | 'text' | 'checkbox';
    id: string;
    label: string;
    valor: any;
}

export interface BotonModal {
    texto: string;
    tipo: 'confirmar' | 'cancelar' | 'otro';
    colorFondo: string;
    colorTexto: string;
}

export interface ResultadoModal {
    [key: string]: any;
}
export type ButtonType =
  | 'number' // 0-9
  | 'decimal' // el punto
  | 'operator' // + - * / ^
  | 'function' // sin, cos, tan
  | 'equal' // =
  | 'action'; // AC, borrar, DEG/RAD

export interface CalcButton {
  label: string;
  value: string;
  type: ButtonType;
  /** Ancho en columnas de la grilla de Ionic. Si no se pone, son 3. */
  size?: number;
}

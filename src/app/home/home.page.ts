import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/angular/standalone';
import { CalcButton } from './calculator';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
  ],
})
export class HomePage {
  constructor() {}

  /** Número grande de la pantalla. */
  displayValue = '0';

  /** Línea pequeña de arriba: "5 +" mientras acumula, "5 + 4 =" al terminar. */
  expression = '';

  /** Modo de ángulo para sen / cos / tan. */
  angleMode: 'DEG' | 'RAD' = 'DEG';

  private operand = '';
  private operator = '';

  /** true = lo que se ve es un resultado, no algo tecleado por el usuario. */
  private isNewEntry = false;

  buttons: CalcButton[] = [
    { label: 'AC', value: 'clear', type: 'action', size: 3 },
    { label: '⌫', value: 'backspace', type: 'action' },
    { label: 'DEG', value: 'angle', type: 'action' },
    { label: '÷', value: '/', type: 'operator' },

    { label: 'sen', value: 'sin', type: 'function' },
    { label: 'cos', value: 'cos', type: 'function' },
    { label: 'tan', value: 'tan', type: 'function' },
    { label: '×', value: '*', type: 'operator' },

    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '−', value: '-', type: 'operator' },

    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '+', value: '+', type: 'operator' },

    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: 'xʸ', value: '^', type: 'operator' },

    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'decimal' },
    { label: '=', value: '=', type: 'equal', size: 6 },
  ];

  /** El botón de ángulo muestra el modo activo; los demás su etiqueta fija. */
  getLabel(button: CalcButton): string {
    return button.value === 'angle' ? this.angleMode : button.label;
  }

  onButtonPress(button: CalcButton) {
    // Con "Error" en pantalla solo se acepta AC o empezar un número nuevo.
    if (
      this.displayValue === 'Error' &&
      button.value !== 'clear' &&
      button.type !== 'number'
    ) {
      return;
    }

    if (button.type === 'action') {
      if (button.value === 'clear') {
        this.displayValue = '0';
        this.expression = '';
        this.operand = '';
        this.operator = '';
        this.isNewEntry = false;
      }

      if (button.value === 'backspace') {
        // Un resultado no se edita a medias: se ignora el borrado.
        if (this.isNewEntry) {
          return;
        }
        this.displayValue =
          this.displayValue.length > 1 ? this.displayValue.slice(0, -1) : '0';
      }

      if (button.value === 'angle') {
        this.angleMode = this.angleMode === 'DEG' ? 'RAD' : 'DEG';
      }
    } else if (button.type === 'number') {
      if (this.isNewEntry) {
        // Sin operación pendiente venimos de un "=": se limpia la línea de arriba.
        if (!this.operator) {
          this.expression = '';
        }
        this.displayValue = button.value; // arranca número nuevo
        this.isNewEntry = false;
      } else {
        this.displayValue =
          this.displayValue === '0'
            ? button.value
            : this.displayValue + button.value;
      }
    } else if (button.type === 'decimal') {
      if (this.isNewEntry) {
        if (!this.operator) {
          this.expression = '';
        }
        this.displayValue = '0.';
        this.isNewEntry = false;
      } else if (!this.displayValue.includes('.')) {
        this.displayValue += '.';
      }
    } else if (button.type === 'function') {
      this.applyFunction(button.value, button.label);
    } else if (button.type === 'operator') {
      // Acumulativo: si ya había una operación pendiente y el usuario
      // alcanzó a escribir el segundo número, se resuelve primero.
      if (this.operator && !this.isNewEntry) {
        this.displayValue = this.calculate();

        if (this.displayValue === 'Error') {
          this.expression = 'No se puede dividir entre 0';
          this.operand = '';
          this.operator = '';
          this.isNewEntry = true;
          return;
        }
      }

      this.operand = this.displayValue;
      this.operator = button.value;
      this.isNewEntry = true; // lo que sigue es un número nuevo
      this.expression = `${this.operand} ${this.symbol(button.value)}`;
    } else if (button.type === 'equal') {
      if (!this.operator) {
        return;
      }

      // Se arma ANTES de calcular: si no, displayValue ya sería el resultado.
      const expr = `${this.operand} ${this.symbol(this.operator)} ${this.displayValue} =`;

      this.displayValue = this.calculate();
      this.expression =
        this.displayValue === 'Error' ? 'No se puede dividir entre 0' : expr;

      this.operand = '';
      this.operator = '';
      this.isNewEntry = true; // el resultado no se sigue tecleando
    }
  }

  /**
   * Aplica sen / cos / tan al número que está en pantalla.
   * Es una operación de UN solo número: no toca operand ni operator.
   */
  private applyFunction(fn: string, label: string) {
    const value = parseFloat(this.displayValue);

    // Math trabaja SIEMPRE en radianes: si estamos en grados, convertimos.
    const angle = this.angleMode === 'DEG' ? (value * Math.PI) / 180 : value;

    let result = 0;

    switch (fn) {
      case 'sin':
        result = Math.sin(angle);
        break;
      case 'cos':
        result = Math.cos(angle);
        break;
      case 'tan':
        // Validación: la tangente no existe en 90°, 270°, ...
        // Se compara contra 1e-12 porque en coma flotante cos(90°) nunca da 0 exacto.
        if (Math.abs(Math.cos(angle)) < 1e-12) {
          this.displayValue = 'Error';
          this.expression = `La tangente no existe en ${value}${this.unit()}`;
          this.operand = '';
          this.operator = '';
          this.isNewEntry = true;
          return;
        }
        result = Math.tan(angle);
        break;
    }

    this.expression = `${label}(${value}${this.unit()})`;
    this.displayValue = this.clean(result);
    this.isNewEntry = true; // el resultado no se sigue tecleando
  }

  /** Resuelve operand (operator) displayValue y devuelve el resultado. */
  private calculate(): string {
    const a = parseFloat(this.operand);
    const b = parseFloat(this.displayValue);
    let result = 0;

    switch (this.operator) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        if (b === 0) {
          return 'Error';
        }
        result = a / b;
        break;
      case '^':
        result = Math.pow(a, b);
        break;
    }

    return this.clean(result);
  }

  /**
   * Limpia la basura del punto flotante:
   * 0.1 + 0.2 -> 0.3   y   sen(180°) -> 0 en vez de 1.22e-16
   */
  private clean(value: number): string {
    const rounded = parseFloat(value.toPrecision(12));
    return (Math.abs(rounded) < 1e-12 ? 0 : rounded).toString();
  }

  /** Sufijo que se muestra en la expresión según el modo. */
  private unit(): string {
    return this.angleMode === 'DEG' ? '°' : ' rad';
  }

  /** Traduce el operador interno al signo que ve el usuario. */
  private symbol(operator: string): string {
    const symbols: Record<string, string> = {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷',
      '^': '^',
    };
    return symbols[operator] ?? operator;
  }

  getSize(button: CalcButton): string {
    return String(button.size ?? 3);
  }
}

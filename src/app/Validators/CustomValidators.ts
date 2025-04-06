import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  validateEmail(email: string): string | null {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email) ? null : 'El email no tiene un formato válido.';
  }
  
  validatePassword(password: string, confirmPassword: string): string | null {
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
    return null;
  }
  
  validateField(field: string, message: string): string | null {
    return field.trim() ? null : message;
  }
  
  validateCareer(career: string): string | null {
    return career ? null : 'Por favor selecciona una carrera válida.';
  }
  
}
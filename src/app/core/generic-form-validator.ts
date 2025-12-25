import { FormGroup, UntypedFormGroup } from '@angular/forms';
import {NotificationService} from './notification.service';

export class GenericFormValidator {

  static errors(container: FormGroup | UntypedFormGroup)
  {
    const validationMessages = GenericFormValidator.processMessages(container);
    if(validationMessages)
    {
      validationMessages.forEach(item=>{
        NotificationService.error(item);
      });
      return true;
    }

    return false;
  }

  /**
   * Processes each control in a FormGroup and returns an array of validation messages.
   * @param container The FormGroup or UntypedFormGroup to process.
   * @returns An array of validation messages.
   */
  static processMessages(container: FormGroup | UntypedFormGroup): string[] {
    const messages: string[] = [];

    for (const controlKey in container.controls) {
      if (container.controls.hasOwnProperty(controlKey)) {
        const control = container.controls[controlKey];

        // If it's a FormGroup, process it recursively
        if (control instanceof FormGroup || control instanceof UntypedFormGroup) {
          const childMessages = this.processMessages(control as FormGroup);
          messages.push(...childMessages);
        } else {
          if ((control.dirty || control.touched) && control.errors) {
            const fieldName = this.formatControlName(controlKey);
            Object.keys(control.errors).forEach((errorKey) => {
              const message = this.getErrorMessage(fieldName, errorKey, control.errors?.[errorKey]);
              if (message) {
                messages.push(message);
              }
            });
          }
        }
      }
    }

    return messages;
  }

  /**
   * Generates a validation message based on the field name and error key.
   * @param fieldName The formatted name of the field.
   * @param errorKey The key of the error (e.g., 'required', 'minlength').
   * @param errorValue The value associated with the error.
   * @returns The validation message.
   */
  private static getErrorMessage(fieldName: string, errorKey: string, errorValue: any): string {
    switch (errorKey) {
      case 'required':
        return `${fieldName} is required`;
      case 'email':
        return `${fieldName} must be a valid email address`;
      case 'minlength':
        return `${fieldName} must be at least ${errorValue.requiredLength} characters long`;
      case 'maxlength':
        return `${fieldName} cannot exceed ${errorValue.requiredLength} characters`;
      case 'pattern':
        return `${fieldName} is invalid`;
      case 'min':
        return `${fieldName} must be at least ${errorValue.min}`;
      case 'max':
        return `${fieldName} must be at most ${errorValue.max}`;
      default:
        return `${fieldName} has an invalid value`;
    }
  }

  /**
   * Formats a control name (e.g., 'firstName' to 'First Name').
   * @param controlName The name of the control.
   * @returns The formatted name.
   */
  private static formatControlName(controlName: string): string {
    // Insert a space before all caps and capitalize the first letter
    const result = controlName.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
}

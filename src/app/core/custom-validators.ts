import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

export class CustomValidators {
  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }

  static passwordMatchValidator(control: AbstractControl) {
    const password: string = control.get('password').value; // get password from our password form control
    const confirmPassword: string = control.get('repassword').value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('repassword').setErrors({ NoPassswordMatch: true });
    }
  }

  static creditCardExpiryValidator(control: AbstractControl) {
    let today, someday;
    const expiryMonth: string = control.get('expiry_month').value;
    const expiryYear: string = control.get('expiry_year').value;
    if(expiryMonth && expiryYear){
      today = new Date();
      someday = new Date();
      someday.setFullYear(expiryYear, expiryMonth, 1);
      if (someday < today) {
        control.get('expiry_month').setErrors({ creditCardExpired: true });      
      }else{
        control.get('expiry_month').setErrors(null);   
      }
    }  
  }

}
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ValidationErrors } from '@angular/forms';


@Component({
  selector: 'app-form-validation-errors',
  templateUrl: './form-validation-errors.component.html',
  styleUrls: ['./form-validation-errors.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormValidationErrorsComponent implements OnInit {


  @Input() errorPrefix: string;
  @Input() minLength: number;
  @Input() maxLength: number;
  @Input() minValue: number;
  @Input() maxValue: number;
  @Input() patternError: string;
  @Input() errors: ValidationErrors;
  @Input() isPrice: boolean;
  @Input() minAmount: number;
  @Input() isupdateBid: boolean;
  @Input() isplaceBid: boolean;

  constructor() { 
    console.log('patternError',this.patternError);
  }

  ngOnInit() { console.log('patternError',this.patternError); }



}

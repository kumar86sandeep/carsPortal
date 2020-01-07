import { Component, OnInit ,Input,ViewChild,ElementRef,EventEmitter,Output} from '@angular/core';
import {FormGroup, FormBuilder,Validators} from '@angular/forms';
declare let $: any;
@Component({
  selector: 'app-search-name',
  templateUrl: './search-name.component.html',
  styleUrls: ['./search-name.component.css']
})

export class SearchNameComponent implements OnInit {
  @Input() isModalOpen: any;
  @ViewChild('searchNameModal') searchNameModal :ElementRef;
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  searchNameForm:FormGroup;
  submitted:boolean = false;
  constructor(private formBuilder:FormBuilder) { }

  ngOnInit() {

    this.searchNameForm = this.formBuilder.group({
      searchName: [null,[Validators.required,Validators.max(30)]]
    });
  }
/**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */
 
 ngOnChanges():void{

  //to show the modal popup
  if(this.isModalOpen) {
    $(this.searchNameModal.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
  }
}


  /**
  * function to close the popup and emit response to onClose event
  * @return void
  */
 cancelsubmitSearch():void {
  this.isModalOpen = false;
   this.searchNameForm.reset()
  this.onCloseModal.emit(false);   
  $(this.searchNameModal.nativeElement).modal('hide') 
}

submitSearch():void{
  this.submitted = true;
  if(this.searchNameForm.invalid) return
  this.submitted = false;
  this.onSubmit.emit(this.searchNameForm.value);
  $(this.searchNameModal.nativeElement).modal('hide') 
  this.searchNameForm.reset()
}
}

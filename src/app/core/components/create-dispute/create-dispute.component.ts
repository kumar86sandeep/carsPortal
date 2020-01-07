import { Component, OnInit ,Input,ViewChild,ElementRef,EventEmitter,Output} from '@angular/core';
import {FormGroup, FormBuilder,Validators} from '@angular/forms';
declare let $: any;
import { Subject } from 'rxjs/Rx'
import { CommonUtilsService } from '../../_services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-dispute',
  templateUrl: './create-dispute.component.html',
  styleUrls: ['./create-dispute.component.css']
})

export class CreateDisputeComponent implements OnInit {
  @Input() isModalOpen: any;
  cars:any;
  @ViewChild('createDisputeModal') createDisputeModal :ElementRef;
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  createDisputeForm:FormGroup;
  submitted:boolean = false;
  public showPreview: boolean = false;
  public initialContentOne: string = "";
  public initialContentTwo: string = "";
  public contentOne: string;
  public contentTwo: string;
  public update$: Subject<any> = new Subject();
  public options1: any = {
    autogrow: true,
    removeformatPasted: true,
    semantic: false,
    btns: [['bold', 'italic'], ['link'], ['foreColor', 'backColor'], ['preformatted']],

  };
  constructor(private formBuilder:FormBuilder,private commonUtilService:CommonUtilsService) { }

  ngOnInit() {

    this.createDisputeForm = this.formBuilder.group({
      // car_id: [null,[Validators.required]],
      title: [null,[Validators.required]],
      description: [null,[Validators.required]],
    });
  }
/**
  * component life cycle default method, runs when input value named 'isOpen' gets change
  * @return void
  */
 
 ngOnChanges():void{

  //to show the modal popup
  if(this.isModalOpen) {
    $(this.createDisputeModal.nativeElement).modal({backdrop: 'static', keyboard: false, show: true}); 
  }
}


  /**
  * function to close the popup and emit response to onClose event
  * @return void
  */
 cancel() {
  this.isModalOpen = false;
   this.createDisputeForm.reset()
  this.onCloseModal.emit(false);   
  $(this.createDisputeModal.nativeElement).modal('hide') 
}

submitDispute(){
 
  this.submitted = true;
   if(!$('.trumbowyg-editor').trumbowyg('html')){
    this.commonUtilService.onError(environment.MESSAGES.DESCRIPTION_REQUIRED);
     return
   }

  this.createDisputeForm.patchValue({
  description:$('.trumbowyg-editor').trumbowyg('html')
  });

  if(!this.createDisputeForm.valid) return
  this.submitted = false;

  this.onSubmit.emit(this.createDisputeForm.value);
  $('.trumbowyg-editor').trumbowyg('html', "");
  $(this.createDisputeModal.nativeElement).modal('hide') 
  this.createDisputeForm.reset()
}
}

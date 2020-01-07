import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankuSubscriberComponent } from './thanku-subscriber.component';

describe('ThankuSubscriberComponent', () => {
  let component: ThankuSubscriberComponent;
  let fixture: ComponentFixture<ThankuSubscriberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThankuSubscriberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThankuSubscriberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

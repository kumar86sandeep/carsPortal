import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncreaseBidComponent } from './increase-bid.component';

describe('IncreaseBidComponent', () => {
  let component: IncreaseBidComponent;
  let fixture: ComponentFixture<IncreaseBidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncreaseBidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncreaseBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDealershipComponent } from './create-dealership.component';

describe('CreateDealershipComponent', () => {
  let component: CreateDealershipComponent;
  let fixture: ComponentFixture<CreateDealershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDealershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDealershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

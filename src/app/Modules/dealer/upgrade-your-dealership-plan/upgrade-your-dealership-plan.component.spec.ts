import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeYourDealershipPlanComponent } from './upgrade-your-dealership-plan.component';

describe('UpgradeYourDealershipPlanComponent', () => {
  let component: UpgradeYourDealershipPlanComponent;
  let fixture: ComponentFixture<UpgradeYourDealershipPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpgradeYourDealershipPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradeYourDealershipPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

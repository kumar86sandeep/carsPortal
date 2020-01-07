import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPendingComponent } from './account-pending.component';

describe('AccountPendingComponent', () => {
  let component: AccountPendingComponent;
  let fixture: ComponentFixture<AccountPendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

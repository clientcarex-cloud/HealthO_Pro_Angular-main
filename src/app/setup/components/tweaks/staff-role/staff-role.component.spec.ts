import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffRoleComponent } from './staff-role.component';

describe('StaffRoleComponent', () => {
  let component: StaffRoleComponent;
  let fixture: ComponentFixture<StaffRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveBtnComponent } from './receive-btn.component';

describe('ReceiveBtnComponent', () => {
  let component: ReceiveBtnComponent;
  let fixture: ComponentFixture<ReceiveBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiveBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

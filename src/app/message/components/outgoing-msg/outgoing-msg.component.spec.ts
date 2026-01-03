import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingMsgComponent } from './outgoing-msg.component';

describe('OutgoingMsgComponent', () => {
  let component: OutgoingMsgComponent;
  let fixture: ComponentFixture<OutgoingMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutgoingMsgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OutgoingMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

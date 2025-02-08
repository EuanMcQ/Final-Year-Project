import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpingHandComponent } from './helping-hand.component';

describe('HelpingHandComponent', () => {
  let component: HelpingHandComponent;
  let fixture: ComponentFixture<HelpingHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpingHandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpingHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

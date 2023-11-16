import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUsuarioComponent } from './chat-usuario.component';

describe('ChatUsuarioComponent', () => {
  let component: ChatUsuarioComponent;
  let fixture: ComponentFixture<ChatUsuarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatUsuarioComponent]
    });
    fixture = TestBed.createComponent(ChatUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, ElementRef, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ModalContentComponent } from './../modal-content/modal-content.component';

import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-chat-usuario',
  templateUrl: './chat-usuario.component.html',
  styleUrls: ['./chat-usuario.component.scss']
})
export class ChatUsuarioComponent {
  private socket: WebSocketSubject<any>;
  message = '';
  chatHistory: any[] = [];
  clientName: any = 'SeuNomeAqui';
  clientNameSet: boolean = false;
  selectedChannelId: any = "";

  @ViewChild('teste') teste: ElementRef | undefined;

  constructor(private dialog: MatDialog) {
    this.socket = new WebSocketSubject('ws://localhost:8081');
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {}
      });
    }
    this.socket.subscribe(
      (message) => {
          if (Array.isArray(message)) {
            message.forEach(element => {
              if (element.channelId === this.selectedChannelId) {
              this.chatHistory.push(element);}
            });
          } else {
            this.chatHistory.push(message);
            this.showNotification(message);
          }

      },
      (error) => {
        console.error('Erro na conexão WebSocket:', error);
      }
    );

  }

  showButton: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

    this.showButton = scrollPosition < documentHeight;
  }

  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  ngOnInit() {
    this.openModal();
    var sessao = localStorage.getItem("Usuario");
    if(sessao != null || sessao != undefined){
      this.clientName = sessao;
      this.setName();
    }

  }

  openModal() {
    const dialogRef = this.dialog.open(ModalContentComponent, {
      width: '400px',
      hasBackdrop: true
    });

    dialogRef.componentInstance.formSubmitted.subscribe((userName: string) => {
      this.clientName = userName;
      this.setName();
    });

    dialogRef.componentInstance.serverSelected.subscribe((serverName: string) => {
      this.onServerSelected(serverName);
      dialogRef.close();
    });
  }
  onServerSelected(serverName: string) {
    this.selectedChannelId = serverName;
    this.socket.next({ type: 'identification', name: this.clientName, channelId: this.selectedChannelId });
    this.scrollToBottom()
  }

  sendMessage() {
    if (this.clientNameSet && this.message) {
      this.socket.next({ type: 'message', message: this.message });
      this.message = '';
      this.scrollToBottom();
     }
  }

  setName(){
    this.clientNameSet = !this.clientNameSet;
    localStorage.setItem("Usuario", this.clientName);
  }



  logout(){
    localStorage.removeItem("Usuario");
    location.reload()

  }

  showNotification(message: any) {
    if (message.sender !== this.clientName && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Nova mensagem recebida');
    }
  }
}

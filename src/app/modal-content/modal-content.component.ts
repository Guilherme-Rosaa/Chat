import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss']
})
export class ModalContentComponent {
  @Output() formSubmitted: EventEmitter<any> = new EventEmitter<any>();
  @Output() serverSelected: EventEmitter<string> = new EventEmitter();


  userName: string = '';
  userLog : boolean = false;
  servers = [
    { name: 'Servidor A' },
    { name: 'Servidor B' },
    { name: 'Servidor C' },
  ];

  ngOnInit(){
    var usuario = localStorage.getItem("Usuario");
    if(usuario != null || usuario!= undefined){
      this.userLog = true;
    }
  }
  onSubmit() {
    this.formSubmitted.emit(this.userName);
    this.userLog = true;
  }

  onSelectServer(serverName: string) {
    this.serverSelected.emit(serverName);
  }
}

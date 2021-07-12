import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {io, Socket} from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private socket: Socket;
  private url = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.url, {transports: ['websocket']});
  }

  joinRoom(data): void {
    this.socket.emit('join', data);
  }

  updatePDF(data): void {
    this.socket.emit('update', data);
  }

  getUpdatedPDF(): Observable<any> {
    return new Observable<{}>(observer => {
      this.socket.on('update pdf', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      }
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUsers();
  }

  createRoom(roomname){
    this.authService.createRoom(roomname).then(res =>{
      console.log(res)
    })
  }

  joinRoom(roomId){

  }
}

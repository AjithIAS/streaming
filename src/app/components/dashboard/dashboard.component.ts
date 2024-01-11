import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}
  rooms: any;
  ngOnInit(): void {
    this.authService.getUsers();
  }
  ngAfterViewInit() {
    this.getRooms();
  }

  createRoom(roomname) {
    this.authService.createRoom(roomname).then((res) => {
      console.log(res.id);
      this.authService.getRoomById(res.id).subscribe((res) => {
        console.log(res);
      });
    });
  }

  joinRoom(roomId) {
    this.authService.joinRoom(roomId);
  }

  getRooms() {
    this.authService.getRooms().subscribe((res) => {
      console.log(res);
      this.rooms = res;
    });
    // console.log(data);
  }

  goToRoom(id) {
    this.router.navigate(['/room', id]);
  }
}

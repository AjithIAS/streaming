import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from 'src/app/shared/services/chat.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
  chatId: string;
  message: string = '';
  messages: any;
  current_video = null;
  current_count = 0;
  loggedUser: string;

  constructor(
    private chat: ChatService,
    private activeRoute: ActivatedRoute,
  ) {
    this.chatId = this.activeRoute.snapshot.params.id;
    this.loggedUser = JSON.parse(localStorage.getItem('user')).uid;
    console.log(this.loggedUser);
  }
  @ViewChild('videoPlayer', { static: false }) videoplayer: ElementRef;
  @ViewChild('videoPlayer1', { static: false }) videoplayer1: ElementRef;

  isPlay: boolean = true;
  toggleVideo(event: any) {
    this.videoplayer.nativeElement.play();
    // console.log(this.videoplayer.nativeElement.currentTime);
  }

  toggleVideo1(event) {
    // this.videoplayer1.nativeElement.pause();
    this.videoplayer1.nativeElement.currentTime = 15;
    // console.log(event);
    // this.videoplayer1.nativeElement.play();
    console.log(event);
  }

  playPause() {
    var myVideo: any = document.getElementById('my_video_1');
    if (myVideo.paused) myVideo.play();
    else myVideo.pause();
  }

  makeBig() {
    var myVideo: any = document.getElementById('my_video_1');
    myVideo.width = 560;
  }

  makeSmall() {
    var myVideo: any = document.getElementById('my_video_1');
    myVideo.width = 320;
  }

  makeNormal() {
    var myVideo: any = document.getElementById('my_video_1');
    myVideo.width = 420;
  }

  skip(value) {
    let video: any = document.getElementById('my_video_1');
    video.currentTime += value;
  }

  restart() {
    let video: any = document.getElementById('my_video_1');
    video.currentTime = 0;
  }

  ngOnInit() {
    this.chat.getChatMessages(this.chatId).subscribe((res) => {
      console.log(res);
      this.messages = res;
    });
    this.chat.collectionInitialization(this.chatId).subscribe((res) => {
      console.log(res);
    });
    // this.current_video = this.videos[this.current_count];
    // this.chat.sendMessage(this.chatId, 'test').then((res) => {
    //   console.log(res);
    // });
  }
  send() {
    this.chat.sendMessage(this.chatId, this.message).then((res) => {
      console.log(res);
      this.message = '';
    });
  }
  nextVideo() {
    console.log(this.current_count);
    // if (this.current_count < this.videos.length - 1) {
    //   this.current_count + 1;
    //   this.current_video = this.videos[this.current_count];
    //   this.videoplayer1.nativeElement.play();
    // }
    // console.log(this.current_count);
    // // this.current_video = this.videos[this.current_count];
    // // console.log(this.current_video);
  }
}

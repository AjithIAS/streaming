import { Injectable, NgZone } from '@angular/core';
import { User } from '../services/user';
// import { FieldValue } from 'firebase-admin/firestore';
// import admin from 'firebase-admin';

import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Message } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  userData: any; // Save logged in user data

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when 
        logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        console.log(user);
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
      console.log();
    });
  }

  sendMessage(chatUID: string, message: string) {
    const messageUID = this.afs.createId();
    const messageData: Message = {
      messageUID,
      sentBy: JSON.parse(localStorage.getItem('user')).uid,
      messageDate: new Date().toString(),
      messageTime: new Date().toLocaleTimeString(),
      message,
    };
    console.log(messageData);

    return this.afs
      .collection(`chatMessages/${chatUID}/messages`)
      .doc(messageUID)
      .set(messageData)
      .then((res) => {
        return this.afs
          .collection('rooms')
          .doc(chatUID)
          .update({ lastMessageSent: messageUID });
      });
  }

  getChatMessages(chatUID: string) {
    return this.afs
      .collection<Message>(`chatMessages/${chatUID}/messages`, (ref) =>
        ref.orderBy('messageDate', 'asc'),
      )
      .valueChanges();
  }
}

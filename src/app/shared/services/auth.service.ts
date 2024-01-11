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
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }

  // Sign in with email/password
  SignIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user);
        this.afAuth.authState.subscribe((user) => {
          console.log(user);
          if (user) {
            this.router.navigate(['dashboard']);
          }
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  loginWithGoogle() {
    this.afAuth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  // Sign up with email/password
  SignUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        this.SendVerificationMail();
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`,
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  createRoom(roomName: string) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 8; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.afs.collection('rooms').add({
      name: roomName,
      users: [this.userData.uid],
      currentSong: null,
      roomCode: autoId,
    });
  }

  getUsers() {
    this.afs
      .collection('rooms')
      .snapshotChanges()
      .subscribe((res) => {
        console.log(res);
      });
  }

  //******************** */
  // Get rooms
  getRooms() {
    let user_id = JSON.parse(localStorage.getItem('user')).uid;
    console.log(user_id);

    let doc = this.afs.collection('rooms', (ref) =>
      ref.where('users', 'array-contains-any', [user_id]),
    );
    let $changes = doc.snapshotChanges().pipe(
      map((changes) =>
        changes.map((c) => ({
          id: c.payload.doc.id,
          ...(c.payload.doc.data() as Record<string, unknown>),
        })),
      ),
    );
    return $changes;
    // .subscribe((res) => {
    //   console.log(res);
    // });
  }

  //----------------------------//

  // Join roomCode
  joinRoom(_id: string) {
    console.log(this.userData.uid);
    let doc = this.afs.collection('rooms', (ref) =>
      ref.where('roomCode', '==', _id),
    );

    doc
      .get()
      .pipe(
        map((snapshot) => {
          // let items = [];
          let filtered = snapshot.docs.map((a) => {
            const data = a.data();
            console.log(data);
            const id = a.id;
            // items.push({ id, ...data });
            return { id, ...(data as Record<string, unknown>) };
          });
          return filtered;
        }),
      )

      .subscribe((_doc: any) => {
        console.log(_doc);
        let id = _doc[0].id; //first result of query [0]
        // console.log(_doc[0]);
        let users = [_doc[0].users];
        if (!_doc[0].users.includes(this.userData.uid)) {
          // ✅ only runs if value not in array
          _doc[0].users.push(this.userData.uid);
        } else {
          alert('Already your in this Room !!!! ');
        }

        // users.push(this.userData.uid);
        const fieldValue = firebase;
        console.log(users);

        this.afs
          .doc(`rooms/${id}`)
          .update({ users: _doc[0].users })
          .then((data) => {
            alert('added Room !!');
          });
      });
  }

  /**
   * GET ROOM BY ID
   */
  getRoomById(id) {
    let collection = this.afs.collection(`rooms`);
    return collection
      .doc(id)
      .valueChanges()
      .pipe(
        map((snapshot) => {
          // console.log(snapshot);
          // let items = [];
          // let filtered = snapshot.docs.map((a) => {
          //   const data = a.data();
          //   console.log(data);
          //   const id = a.id;
          //   // items.push({ id, ...data });
          //   return { id, ...(data as Record<string, unknown>) };
          // });
          return snapshot;
        }),
      );
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }
}

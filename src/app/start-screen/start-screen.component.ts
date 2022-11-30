import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { collection, setDoc } from 'firebase/firestore';
import { Game } from 'src/models/game';
import { Firestore, collectionData, docData, doc, addDoc} from '@angular/fire/firestore';


@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {

  constructor(private firestore: Firestore, private router: Router) { }
  

  ngOnInit(): void {
  }

  async newGame(){
    //Start game
     let game = new Game();

     const coll = collection(this.firestore, 'games');
     const docRef = await addDoc(coll, 
      { game: game.toJson() }).then((gameInfo: any) => {
        //console.log(gameInfo);
        this.router.navigateByUrl('/game/' + gameInfo.id);
      }); 
  }

}

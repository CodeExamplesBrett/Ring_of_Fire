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
     //get the entire collection called "games"
     const coll = collection(this.firestore, 'games');
     //add new document to the collection
     const docRef = await addDoc(coll, 
      //add our json from the game object to the document in the collection
      { game: game.toJson() }).then((gameInfo: any) => {
        //console.log('the gameinfo from start-screttn', gameInfo);
        //console.log('the json', game.toJson);
        // navigate to the url with the new document id
        this.router.navigateByUrl('/game/' + gameInfo.id);
      }); 
  }

}

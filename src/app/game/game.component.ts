import { Component, OnInit, Injectable } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog'; 
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, getDoc, collectionData, docData, updateDoc, collection, doc, DocumentData, onSnapshot} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EditPlayerComponent } from '../edit-player/edit-player.component';

@Injectable({
  providedIn: 'root',
})

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  game: Game;
  game_observed$: Observable<DocumentData>
  gameId: any;
  gameOver = false;

  constructor(private router: Router, private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog) { 
    
  }

  ngOnInit(): void {
    //this.create();
    this.newGame();
    this.getMyGame();
  }

  getMyGame(){
    this.route.params.subscribe((params) => {
      //gets the id from the url... id is the variable defined in app routing in app-routing-module.ts
      this.gameId = params['id'];
      //collection selects the relevant firebase collection
      const coll = collection(this.firestore, 'games');
      //doc selects the current game document via game id read above from the url
      const docRef = doc(coll, this.gameId);
      //observable looks at the changes in this document with docData
      this.game_observed$ = docData(docRef);
      //data is subscribed
      this.game_observed$.subscribe( (game: DocumentData) => {
      this.updateGame(game)
      //console.log('the game', game);
       });
      })
  }

  updateGame(game){
        this.game.currentPlayer = game['currentPlayer'];
        this.game.playedCards = game['playedCards'];
        this.game.players = game['players'];
        this.game.player_images = game['player_images'];
        this.game.stack = game['stack'];
        this.game.pickCardAnimation = game['pickCardAnimation'];
        this.game.currentCard = game['currentCard'];
  }

  newGame(){
    this.game = new Game();
  }
  
  restartGame(){
    this.gameOver = false;
    this.game = new Game();
    this.saveGame();
  }


  takeCard(){
    //open the add plaxer dia
    if(this.game.stack.length == 0) {
      this.gameOver = true;
    } else if(this.game.players.length < 2){
      this.openDialog()
    }
    else if(!this.game.pickCardAnimation){
      this.pushCard()
    }
  }

  pushCard(){
      this.game.currentCard = this.game.stack.pop()
      //animate is carried out
      this.game.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.saveGame();
      //with setTimeout it's only possible to click on the pile every second as pickCardAnimation is set back to false..
      setTimeout(()=>{
        //push played card to array playedCards
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();

      }, 1000);
  }


  editPlayer(playerId){
    //console.log('player', playerId)
    const dialogRef = this.dialog.open(EditPlayerComponent);
    dialogRef.afterClosed().subscribe((change: string) => {
      if(change){
        if(change == 'DELETE') {
            this.game.player_images.splice(playerId, 1)
            this.game.players.splice(playerId, 1)
        } else {
          //console.log('received change', change);
          //the selected avatar is updated in the array at index = playerId
          this.game.player_images[playerId] = change;
        }
        this.saveGame();
      
      }
    });
    } 
      

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
    //console.log('The dialog was closed', name);
    //only add the player if the length of the name is greater than 0
    if(name && name.length > 0) {
      this.game.players.push(name);
      this.game.player_images.push('avatar.png');

      this.saveGame();
    } 
    });
  }


  saveGame(){
    updateDoc(doc(this.firestore,'games', this.gameId), 
      this.game.toJson() 
    );
    
  };

}
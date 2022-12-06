import { Component, OnInit, Injectable } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog'; 
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, getDoc, collectionData, docData, updateDoc} from '@angular/fire/firestore';
import { CollectionReference,
  DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc } from '@firebase/firestore';

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
  [x: string]: any;

  private gamesCollection: CollectionReference<DocumentData>;
  game: Game;
  game_observed$: Observable<any>

  gameId: any;
  gameOver = false;

  // als test item for create
  newItem: {id: "1"}

 
  constructor(private router: Router, private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog) { 
    this.gamesCollection = collection(this.firestore, 'games');
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
  
        //this.get(this.gameId)
  
        const coll = collection(this.firestore, 'games');
        //collectionData gets the data from the document
        this.game_observed$ = collectionData(coll)
       //console.log('the id', this.gameId )
        this.game_observed$.subscribe( ( game: any) => {
        getDoc(this.gameId);
      
        console.log('the game', game);
        this.game.currentPlayer = game.currentPlayer;
        this.game.playedCards = game.playedCards;
        this.game.players = game.players;
        this.game.player_images = game.player_images;
        this.game.stack = game.stack;
        this.game.pickCardAnimation = game.pickCardAnimation;
        this.game.currentCard = game.currentCard;
        });
  
        
      })
      

  }

  newGame(){
    this.game = new Game();
  }
  
  restartGame(){
    this.gameOver = false;
    this.game = new Game();
  }


  takeCard(){
    //with setTimeout it's only possible to click on the pile every second as pickCardAnimation is set back to false..
    if(this.game.stack.length == 0) {
      this.gameOver = true;
    } else if(!this.game.pickCardAnimation){
      this.game.currentCard = this.game.stack.pop()
      //console.log(this.currentCard)

      //animate is carried out
      this.game.pickCardAnimation = true;
      
      console.log('New card:' + this.game.currentCard);
      console.log(this.game)

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.saveGame();
      
      setTimeout(()=>{
        //push payed card to array playedCards
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();

      }, 1000);
    }
  }

  editPlayer(playerId){
    console.log('player', playerId)
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
    updateDoc(doc(this.firestore,'games', this.gameId), {
      game: this.game.toJson() 
    });
    
  };

}









/*export class PokedexFirestoreService {
  private pokemonCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) {
    this.pokemonCollection = collection(this.firestore, 'pokemon');
  }

  getAll() {
    return collectionData(this.pokemonCollection, {
      idField: 'id',
    }) as Observable<Pokemon[]>;
  }

  get(id: string) {
    const pokemonDocumentReference = doc(this.firestore, `pokemon/${id}`);
    return docData(pokemonDocumentReference, { idField: 'id' });
  }

  create(pokemon: Pokemon) {
    return addDoc(this.pokemonCollection, pokemon);
  }

  update(pokemon: Pokemon) {
    const pokemonDocumentReference = doc(
      this.firestore,
      `pokemon/${pokemon.id}`
    );
    return updateDoc(pokemonDocumentReference, { ...pokemon });
  }

  delete(id: string) {
    const pokemonDocumentReference = doc(this.firestore, `pokemon/${id}`);
    return deleteDoc(pokemonDocumentReference);
  }
}  */

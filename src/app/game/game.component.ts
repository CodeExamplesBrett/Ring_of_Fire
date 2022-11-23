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

  gameId;

  // als test item for create
  newItem: {id: "1"}

 

  constructor(private router: Router, private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog) { 
    this.gamesCollection = collection(this.firestore, 'games');
  }

  create() {
  addDoc(this.gamesCollection, this.game.toJson());
  }

  delete(id: string) {
    const gamesDocumentReference = doc(this.firestore, `games/${id}`);
    return deleteDoc(gamesDocumentReference);
  }

  async get(gameId: string) {
    const docRef = doc(this.firestore, `games/${gameId}`);
    let current = await getDoc(docRef);
    console.log('current', current) 
  }




  ngOnInit(): void {
    //this.create();
    this.newGame();
    this.route.params.subscribe((params) => {
      this.gameId = params['id'];

      //this.get(this.gameId)

      const coll = collection(this.firestore, 'games');
      this.game_observed$ = collectionData(coll, this.gameId)
      this.game_observed$.subscribe( ( games: any) => {
      //getDoc(this.gameId);
      let ourGame = games[0]['game'];
      console.log('the game', games[0]['game']);
      this.game.currentPlayer = ourGame.currentPlayer;
      this.game.playedCards = ourGame.playedCards;
      this.game.players = ourGame.players;
      this.game.stack = ourGame.stack;
      this.game.pickCardAnimation = ourGame.pickCardAnimation;
      this.game.currentCard = ourGame.currentCard;
      });
    })
    
   
  }

  newGame(){
    this.game = new Game();
  }



  takeCard(){
    if(!this.game.pickCardAnimation){
      this.game.currentCard = this.game.stack.pop()
      //console.log(this.currentCard)
      this.game.pickCardAnimation = true;
      
      console.log('New card:' + this.game.currentCard);
      console.log(this.game)

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      
      setTimeout(()=>{
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();

      }, 1000);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
    //console.log('The dialog was closed', name);
    if(name && name.length > 0) {
      this.game.players.push(name);
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

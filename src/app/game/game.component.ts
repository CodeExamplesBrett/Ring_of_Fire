import { Component, OnInit, Injectable } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog'; 
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, collectionData, docData} from '@angular/fire/firestore';
import { CollectionReference,
  DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc, } from '@firebase/firestore';

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

  pickCardAnimation = false;
  currentCard:string = '';
  game: Game;
  game$: Observable<any>

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

  get(gameId: string) {
    const docRef = doc(this.firestore, `games/${gameId}`);
    let current = docData(docRef, { idField: 'gameId' });
    console.log('current', current) 
  }




  ngOnInit(): void {
    this.newGame();
   //this.create();
   //this.delete('2');
   this.route.params.subscribe((params) =>{
   this.gameId = params['id']
   console.log('key', this.gameId);

  /* const docRef = doc(this.firestore, `games/${this.gameId}`);
    let current = docData(docRef, { idField: 'gameId' });
    console.log('current', current)   */



   const coll = collection(this.firestore, 'games');
    this.game$ = collectionData(coll, this.gameId);
    this.game$.subscribe( (games: any)=> {
    //getDoc(this.gameId) 
    console.log('games Info', games)  
    });
   });


  }

  newGame(){
    this.game = new Game();

    
  
  }

  takeCard(){
    if(!this.pickCardAnimation){
      this.currentCard = this.game.stack.pop()
      //console.log(this.currentCard)
      this.pickCardAnimation = true;
      
      console.log('New card:' + this.currentCard);
      console.log(this.game)

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      
      setTimeout(()=>{
        this.game.playedCards.push(this.currentCard);
        this.pickCardAnimation = false;

      }, 1000);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
    //console.log('The dialog was closed', name);
    if(name && name.length > 0) {
      this.game.players.push(name);
    } 
    });
  }
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

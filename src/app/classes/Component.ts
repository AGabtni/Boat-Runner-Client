import {GameObject} from './GameObject';



export class Component {

  gameObject : GameObject;
  constructor(gameObject) {
    this.gameObject = gameObject;
  }
  update() {
  }
}
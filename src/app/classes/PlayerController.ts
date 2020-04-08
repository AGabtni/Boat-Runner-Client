import * as THREE from 'three';

import {Component} from './Component';
import {SkinInstance} from './SkinInstance';



import { globals } from './globals';
import { models, inputManager, soundsLibrary  } from '../app.component';


/**
 Player controller script for player gameobject 
*/
export class PlayerController extends Component {
    
    kForward = new THREE.Vector3(0, 0, 1);
    skinInstance;
    turnSpeed;
    offscreenTimer;
    maxTimeOffScreen;

    hasCollided;
    collisionSpeed ; 
    collisionDuration ;
    maxRightAngle ;
    maxLeftAngle;


    engineSlowAudio;
    engineMediumAudio;
    engineFastAudio;

    maxHealth;
    private _current_health;
    get health(): number{
      return this._current_health;
    }
    set health(hp:number){
      this._current_health = hp;
    }

    private _targetSpeed ;
    get targetSpeed() : number{
      return this._targetSpeed;
    }
    set targetSpeed(speed : number) {
      this._targetSpeed = speed;    
    }


   


    constructor(gameObject) {

      super(gameObject);
      const model = models.boat;
      this.skinInstance = gameObject.addComponent(SkinInstance, model);
      this.turnSpeed = globals.moveSpeed ;
      this.offscreenTimer = 0;
      this.maxTimeOffScreen = 1;
      this.maxRightAngle=-1.85625;
      this.maxLeftAngle=-2.85625;
      this.hasCollided = false;
      this.collisionDuration = 0;
      this.targetSpeed = globals.moveSpeed;
      this.maxHealth = 100;
      this.health = this.maxHealth;
    
      gameObject.transform.rotation.y = -2.35625;
      globals.playerPosition = new THREE.Vector3(0,0,0);

      this.initSound()
      this.updateUI();
    }


    update() {
      const {deltaTime, moveSpeed, cameraInfo} = globals;
      const {frustum} =  cameraInfo;
      const { transform } = this.gameObject;
      
      
        
      //Translation handle
      transform.translateOnAxis(this.kForward, moveSpeed );

      //adjust player speed to target speed
      if(this.targetSpeed != globals.moveSpeed )
        globals.moveSpeed = THREE.Math.lerp(this.targetSpeed ,globals.moveSpeed, 0.2);

      


      //Sterring handle
      const delta = (inputManager.keys.left.down  ?  1 : 0) +
                    (inputManager.keys.right.down ? -1 : 0);
      if(delta){
        if(delta === 1 && transform.rotation.y< this.maxRightAngle )
          transform.rotation.y = THREE.Math.lerp(transform.rotation.y,this.maxRightAngle,deltaTime*this.turnSpeed );
        if(delta === -1 && transform.rotation.y > this.maxLeftAngle)
          transform.rotation.y = THREE.Math.lerp(transform.rotation.y,this.maxLeftAngle,deltaTime*this.turnSpeed);
      }


      //Update parcouredDistance if the player is rotating (FOR THE CAMERA):
      //is Right
      if(transform.position.x < transform.position.z){
        globals.parcouredDistance = THREE.Math.lerp(globals.parcouredDistance,transform.position.x, 0.2);
      }
      //is Left 
      else if(transform.position.z < transform.position.x  ){
         globals.parcouredDistance = THREE.Math.lerp(globals.parcouredDistance,transform.position.z, 0.2);
      }
      else{
        globals.parcouredDistance = transform.position.z;
      }

      transform.rotation.y = THREE.Math.lerp(transform.rotation.y,-2.35625,deltaTime*this.turnSpeed);
      
      
      //Check if player is out of screen and reposition
      if(frustum.containsPoint(transform.position)){

        this.offscreenTimer = 0;
      }else{
        this.offscreenTimer += globals.deltaTime;
        if(this.offscreenTimer >= this.maxTimeOffScreen){

          transform.position.set(globals.parcouredDistance,0 , globals.parcouredDistance);
          transform.rotation.y = -2.35625;
        }
      }
      

      
      
     
      this.buoancyUpdate();
      this.updateAudio();

      globals.playerPosition = transform.position;
      

    }

    initSound(){

      //Audio setup
      this.engineSlowAudio =  new THREE.PositionalAudio( globals.audioListener );
      this.engineMediumAudio =  new THREE.PositionalAudio( globals.audioListener );
      this.engineFastAudio =  new THREE.PositionalAudio( globals.audioListener );

      //init slow audio
      this.engineSlowAudio.setBuffer( soundsLibrary.engine_slow.clip );
      this.engineSlowAudio.setVolume(5);
      this.engineSlowAudio.setLoop(true);
      this.engineSlowAudio.play();


      //init medium and fast audio

      this.engineMediumAudio.setBuffer( soundsLibrary.engine_medium.clip );
      this.engineMediumAudio.setVolume(5);
      this.engineMediumAudio.setLoop(true);

        
      this.engineFastAudio.setBuffer( soundsLibrary.engine_fast.clip );
      this.engineFastAudio.setVolume(5);
      this.engineFastAudio.setLoop(true);


      this.gameObject.transform.add(this.engineSlowAudio);


    }

    changeAudio(oldAudio , newAudio){

      oldAudio.stop();
      this.gameObject.transform.remove(oldAudio);
      this.gameObject.transform.add(newAudio);
      this.gameObject.transform.children[1].play();


    }

    updateAudio(){
      
      if(globals.moveSpeed>0.4 && this.engineSlowAudio.isPlaying){
        
        this.changeAudio(this.engineSlowAudio,this.engineMediumAudio);
      }

      if(globals.moveSpeed>0.6 && this.engineMediumAudio.isPlaying){
        
        this.changeAudio(this.engineMediumAudio,this.engineFastAudio);
      }


    }


    dealDamage(factor){
      var damage = 10 * factor;
      damage = Math.floor(damage)
      this.health = this.health - damage ;
      if(this.health < 0 )
        this.health = 0;
        this.updateUI();
      
    }

    updateUI(){
      var a = this.health * (100/this.maxHealth);
      $('.health-bar').animate({
        'width': a + "%"
      },700);
      $('.health-bar-filled').animate({
        'width': a + "%"
      },500);
    }
    
    

    buoancyUpdate(){
      var obj = this.gameObject.transform;
      if(!obj.visible)
          return;

      if(obj.time == undefined){
          obj.time =   Math.random() * Math.PI * 2; 
          obj.initialPosition = obj.position;
          
      }
        obj.time += 0.05;
        obj.position.y = obj.initialPosition.y + Math.cos(obj.time) * 0.01;
    // Rotate object slightly 
    //obj.rotation.z = obj.initialRotation.z + Math.sin(obj.time * 0.5) * 2 * 0.02;

    }

    onCollisionEnter(hitObject){
      if(this.hasCollided)
        return;
      
      const playerSpeed = this.targetSpeed;
      this.hasCollided = true
      this.targetSpeed = -0.5;
      this.dealDamage(hitObject.transform.position.distanceTo(this.gameObject.transform.position));

      setTimeout(()=>{

        this.hasCollided = false;
        this.targetSpeed = playerSpeed;
      },350);
              
    }


    onCollisionExit(){

    }
    


  }
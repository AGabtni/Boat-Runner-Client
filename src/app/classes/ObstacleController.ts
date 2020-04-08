import * as THREE from 'three';

import {Component} from './Component';
import {SkinInstance} from './SkinInstance';



import { models, soundsLibrary  } from '../app.component';
import { globals } from './globals';
import { PlayerController } from './PlayerController';


/**
 Obstacle controller script
*/
export class ObstacleController extends Component {
    private _player : PlayerController = null ;
    get player() : PlayerController{
        return this._player;
    }
    set player(p : PlayerController) {
        this._player = p;    
    }
    skinInstance ;
    transform ;
    particleGeometry;
    particleCount;
    particles;
    explosionPower;
    hasCollided ; 
    savedSpeed;
    
    maxTimeStandby = 0.4;

    forwardVector;
    triggerAudio
    constructor(gameObject) {
        super(gameObject);
        const model = models.mine;
        this.skinInstance = gameObject.addComponent(SkinInstance, model);

        //Audio setup
        this.triggerAudio =  new THREE.PositionalAudio( globals.audioListener );
        this.triggerAudio.setBuffer( soundsLibrary.explosion.clip );
	    this.triggerAudio.setVolume(3);
        gameObject.transform.add(this.triggerAudio)
        

        this.transform = gameObject.transform;
        this.explosionPower = 1.06;
        this.addExplosion();
        this.hasCollided = false;
        this.forwardVector = new THREE.Vector3(1,0,0);
    }


    update(){

        if(Math.abs(this.gameObject.transform.position.z) < Math.abs(globals.parcouredDistance)-20){
            this.gameObject.transform.visible = false;
        }
        
        if(this.player.gameObject.transform.position.distanceTo(this.gameObject.transform.position)<2 && !this.hasCollided){
            this.explode();
        }
        
        
        
        this.doExplosionLogic();
        this.buoancyUpdate();
        
    }

    buoancyUpdate(){
        var obj = this.transform;
        if(!obj.visible || this.hasCollided)
            return;

        if(obj.time == undefined){
            obj.time =   Math.random() * Math.PI * 2; 
            obj.initialPosition = obj.position;
		    obj.initialRotation = obj.rotation;
            
        }
        obj.time += 0.01;
        obj.position.y = obj.initialPosition.y + Math.cos(obj.time) * -0.005;
        
        var factor = Math.random()*0.03 +0.05;
        obj.position.x = obj.position.x + Math.cos(obj.time) * factor;
        obj.position.z = obj.position.z - Math.cos(obj.time) * factor;
        
        // Rotate object slightly 
        
        //obj.rotation.z = obj.initialRotation.z + Math.sin(obj.time * 0.5) * 2 * 0.02;

    }


    addExplosion(){
        const {scene} = globals;
        this.particleGeometry = new THREE.Geometry();
        this.particleCount = 100;
        for (var i = 0; i < this.particleCount; i ++ ) {
            var vertex = new THREE.Vector3();
            this.particleGeometry.vertices.push( vertex );
        }
        var pMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 1,
          map: new THREE.TextureLoader().load(
            "../../../assets/textures/particle.png"
          ),
          blending: THREE.AdditiveBlending,
          transparent: true
        });
        this.particles = new THREE.Points( this.particleGeometry, pMaterial );
        scene.add( this.particles );
        this.particles.visible=false;
    }
    
    
    explode(){
        const {playerPosition} = globals;
        this.explosionPower=1.5;
        this.player.onCollisionEnter(this.gameObject);
        
        if(!this.triggerAudio.isPlaying)
            this.transform.children[1].play()
        
        globals.screenShaker.shake( globals.camera, new THREE.Vector3(2.5, 1,2.5), 350 );
        

        this.particles.position.y=playerPosition.y;
        this.particles.position.z=playerPosition.z;
        this.particles.position.x=playerPosition.x;
        for (var i = 0; i < this.particleCount; i ++ ) {
            var vertex = new THREE.Vector3();
            vertex.x = 0.2+Math.random() * 0.4;
            vertex.y = 0.2+Math.random() * 0.4 ;
            vertex.z = 0.2+Math.random() * 0.4;
            this.particleGeometry.vertices[i]=vertex;
        }
        
        
        this.hasCollided = true;
        

    }
    
    doExplosionLogic(){
        if(!this.hasCollided){
            return;
        
        }
        
        if(this.explosionPower>1){
            this.explosionPower-=globals.deltaTime;
            this.particles.visible=true;
            

        }
        else{
            this.hasCollided = false;
            this.particles.visible=false;
            this.gameObject.transform.visible = false;
            
            
        }
        for (var i = 0; i < this.particleCount; i ++ ) {
            this.particleGeometry.vertices[i].multiplyScalar(this.explosionPower);
        }

        
        this.particleGeometry.verticesNeedUpdate = true;
    }

    


}
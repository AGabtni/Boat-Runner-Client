import * as THREE from 'three';

import {GameObject} from './GameObject';
import {SafeArray} from './SafeArray';
import { ObstacleController } from './ObstacleController';
import { globals } from './globals';
import { resolveSanitizationFn } from '@angular/compiler/src/render3/view/template';
import { networkInterfaces } from 'os';
import { Camera, Vector3 } from 'three';
import { ɵConsole } from '@angular/core';
import { PlayerController } from './PlayerController';

export  class ObstaclePooler {
    rockPool ;
    activeRocksPool;
    rocksCounter = 0;

    xOffsetObstacle = 2;
    
    distanceAhead = 150;

    constructor() {

      this.rockPool = [];
      this.activeRocksPool = [];
      globals.lastObstaclePosition = new THREE.Vector3(0,0,0);
      globals.poolerPosition = new THREE.Vector3(0,0,0);

      
      
    }


    //Create gameobject for obstacle and associate with player
    createObstacle (parent){
      this.rocksCounter ++;
      const name = "Rock_"+this.rocksCounter;
      const obstacleObject = new GameObject(parent,name);
      obstacleObject.addComponent(ObstacleController);

      //Add association to player to handle collision
      var player = globals.gameObjectManager.getGameObject('player');
      obstacleObject.getComponent(ObstacleController).player = player.getComponent(PlayerController);
      
      return obstacleObject;
      
    }

    
    //Create a pool of obstacles
    createRocksPool(){
      var maxElemsInPool = 10;
      var newObstacle ;

      for(var i =0; i<maxElemsInPool; i++ ){

        newObstacle = this.createObstacle(globals.scene);
        newObstacle.transform.visible = false;
        this.rockPool.push(newObstacle);


      }

    }


    //Pool obstacle 

    poolObject(){
      var pooledObject = null;
      if(this.rockPool.length >= 0){
        this.rockPool.forEach((element,index)=>{
          if(!element.transform.visible){
            
            pooledObject = element;
          }
        });
      }
      if(pooledObject != null){

        return pooledObject;
      }


      var newObject = this.createObstacle(globals.scene);
      this.rockPool.push(newObject);
      return newObject;
    }

    //Setup new obstacle
    addPooledObstacle(){
      const {camera} = globals;
      var newObstacle ;
      newObstacle = this.poolObject();

      //Setup obstacle 
      //From 5 to 15 vertically
      var zOffset = -(Math.random()*10+5 );

      //From -10 to 10 horizontally
      var rowOffset = Math.random()*20-10;
      rowOffset = rowOffset * camera.aspect;
      
      globals.lastObstaclePosition.z = globals.lastObstaclePosition.z+zOffset;
      newObstacle.transform.position.set(globals.lastObstaclePosition.z+rowOffset,-0.1,globals.lastObstaclePosition.z-rowOffset);
      newObstacle.transform.visible = true;
      globals.scene.add(newObstacle.transform);


      globals.poolerPosition = newObstacle.transform.position;
      
    }

    update() {


      if(Math.abs(globals.poolerPosition.z)  < Math.abs(globals.parcouredDistance) + this.distanceAhead){

        this.addPooledObstacle();
      }
      
      this.rockPool.forEach(rock => {
          if(rock.transform.visible)
            rock.update();
      });


    }


    
  }
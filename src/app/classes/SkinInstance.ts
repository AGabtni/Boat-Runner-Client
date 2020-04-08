import * as THREE from 'three';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

import {Component} from './Component';
import {globals} from './globals'





export class SkinInstance extends Component {

    model;
    animRoot;
    mixer;
    actions;
    currentAnimation ; 
    sound ; 
    constructor(gameObject, model) {
      super(gameObject);
      this.model = model;
      this.animRoot = SkeletonUtils.clone(this.model.gltf.scene);
      this.mixer = new THREE.AnimationMixer(this.animRoot);
      gameObject.transform.add(this.animRoot);
      this.actions = {};
     

    }


    setAnimation(animName) {
      this.currentAnimation = animName;
      const clip = this.model.animations[animName];
        
     
      // get or create existing action for clip
      const action = this.mixer.clipAction(clip);
      action.enabled = true;
      action.reset();
      action.play();
      this.actions[animName] = action;
    }






     update() {
      this.mixer.update(globals.deltaTime);
     
    }

}
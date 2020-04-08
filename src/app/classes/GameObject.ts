import * as THREE from 'three';


 function removeArrayElement(array, element) {
    const ndx = array.indexOf(element);
    if (ndx >= 0) {
      array.splice(ndx, 1);
    }
  }

export class GameObject{
	

	name = "gameObject";
	components;
	transform;

	constructor(parent, name) {


      this.name = name;
      this.components = [];
      this.transform = new THREE.Object3D();
      this.transform.rotation.y = -2.35;
      

      //DEBUG ONLY must add rendered in globals
      //const widgetControl = new TransformControls( globals.camera, globals.renderer.domElement);
      //widgetControl.attach(this.transform );
    

      //
      if(parent != null){
        parent.add(this.transform);

        //Debug only
        //parent.add(widgetControl);

      }
    }


	addComponent(ComponentType, ...args) {
      const component = new ComponentType(this, ...args);
      this.components.push(component);
      return component;
    }


    removeComponent(component) {
      removeArrayElement(this.components, component);
    }
    getComponent(ComponentType) {
      return this.components.find(c => c instanceof ComponentType);
    }
    update() {
      for (const component of this.components) {
        component.update();
      }
    }

    destroy(){

      this.components.forEach(element => {
          this.removeComponent(element);
      });
      this.transform = null;
      this.name="";
    }




}

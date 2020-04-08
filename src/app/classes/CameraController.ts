
import * as THREE from 'three';


import { Component } from "./Component";
import { globals } from "./globals";




export class CameraController extends Component {
	
	projScreenMatrix;
	frustum;
    public target : THREE.Vector3 ;
    public radius : number = 1;
    public targetRadius : number = 15;

	constructor(gameObject){
		super(gameObject);
		this.projScreenMatrix = new THREE.Matrix4();
		this.frustum = new THREE.Frustum();

		//follow target:
		this.radius= 3;

	}


	public setRadius(value: number, instantly: boolean = false): void
    {
        this.targetRadius = Math.max(0.001, value);
        if (instantly === true)
        {
            this.radius = value;
        }
    }


	update(){
		const {camera} = globals;
		this.projScreenMatrix.multiplyMatrices(
			camera.projectionMatrix, camera.matrixWorldInverse
		);

		this.frustum.setFromMatrix(this.projScreenMatrix);
			
		this.radius = THREE.Math.lerp(this.radius,this.targetRadius, 0.2);
		camera.position.set(
			THREE.Math.lerp(camera.position.x,globals.parcouredDistance+this.radius,0.2),
			THREE.Math.lerp(camera.position.y,2+this.radius,0.2),
			THREE.Math.lerp(camera.position.z,globals.parcouredDistance+this.radius,0.2)
		);
		
		camera.lookAt(new THREE.Vector3(globals.parcouredDistance,2,globals.parcouredDistance));

		
			
		camera.updateMatrix();

		
	}


}
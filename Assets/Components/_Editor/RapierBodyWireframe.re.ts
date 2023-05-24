import * as RE from 'rogue-engine';
import * as THREE from 'three';

import RapierCuboid from '../Colliders/RapierCuboid.re';
import RapierBall from '../Colliders/RapierBall.re';
import RapierCylinder from '../Colliders/RapierCylinder.re';
import RapierCone from '../Colliders/RapierCone.re';
import RapierCapsule from '../Colliders/RapierCapsule.re';
import RapierCollider from '../Colliders/RapierCollider';

export default class RapierBodyWireframe extends RE.Component {
  static isEditorComponent = true;

  selectedObjects: THREE.Object3D[] = [];
  colliders: THREE.Object3D[] = [];
  wireframeMaterial = new THREE.MeshStandardMaterial({ wireframe: true, emissive: new THREE.Color("#00FF00"), color: new THREE.Color("#000000") });

  private handleOnComponentAdded = { stop: () => { } };
  private handleOnComponentRemoved = { stop: () => { } };

  private handleOnPlay = { stop: () => { } };

  private resetHandler = (component: RE.Component) => {
    component instanceof RapierCollider && this.setupImpostors();
  }

  start() {
    this.handleOnComponentAdded.stop();
    this.handleOnComponentRemoved.stop();
    this.handleOnPlay.stop();

    this.handleOnComponentAdded = RE.onComponentAdded(this.resetHandler);
    this.handleOnComponentRemoved = RE.onComponentRemoved(this.resetHandler);

    this.handleOnPlay = RE.Runtime.onPlay(() => {
      this.handleOnComponentAdded.stop();
      this.handleOnComponentRemoved.stop();
      this.cleanupImpostors();
    });
  }

  afterUpdate() {
    const selectedObjects = window["rogue-editor"].Project.selectedObjects as THREE.Object3D[];

    if (!this.arraysAreEqual(selectedObjects, this.selectedObjects)) {
      this.selectedObjects = selectedObjects.slice(0);
      this.setupImpostors();
    }

    if (this.selectedObjects.length === 0) return;

    this.updateImpostors();
  }

  private updateImpostors() {
    this.colliders.forEach(impostor => {
      this.updateColliderMesh(impostor.userData.cannonShape, impostor as THREE.Mesh);
    });
  }

  private cleanupImpostors() {
    this.colliders.forEach(impostor => {
      impostor.userData.cannonShape = null;
      RE.App.currentScene.remove(impostor);
      RE.dispose(impostor);
    });

    this.colliders = [];
  }

  private setupImpostors() {
    this.cleanupImpostors();

    this.selectedObjects.forEach(selected => {
      selected.traverse(object => {
        const objComponents = RE.components[object.uuid];

        if (!objComponents) return;

        objComponents.forEach(component => {
          if (!(component instanceof RapierCollider)) return;

          let impostor = RE.App.currentScene.getObjectByName("EDITOR_OBJECT_BB_" + object.uuid);

          if (impostor) return;

          impostor = this.getColliderMesh(component);

          if (impostor) {
            impostor.name = "EDITOR_OBJECT_BB_" + object.uuid;
            impostor.userData.isEditorObject = true;
            RE.App.currentScene.add(impostor);
          } else {
            return;
          }

          impostor.userData.cannonShape = component;
          this.colliders.push(impostor);
        });
      });
    });
  }

  private arraysAreEqual(array1: any[], array2: any[]) {
    if (array1.length !== array2.length) return false;

    return array1.every((element, i) => {
      return array2[i] === element;
    });
  }

  private getColliderMesh(component: RapierCollider): THREE.Mesh | undefined {
    if (component instanceof RapierCuboid) {
      return new THREE.Mesh(
        new THREE.BoxBufferGeometry(),
        this.wireframeMaterial,
      );
    }

    if (component instanceof RapierBall) {
      const scale = component.object3d.scale;
      const maxSide = Math.max(scale.x, scale.y, scale.z);

      const radius = (1 + component.radiusOffset) * (maxSide);
      const compensatedRadius = radius + (radius * 0.01);
      const segments = 15;

      return new THREE.Mesh(
        new THREE.SphereBufferGeometry(compensatedRadius, segments, segments),
        this.wireframeMaterial,
      );
    }

    if (component instanceof RapierCylinder) {
      const radiusTop = component.radius;
      const radiusBottom = component.radius;
      const height = component.halfHeight * 2;
      const segments = 15;
      const mesh = new THREE.Mesh(
        new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, segments),
        this.wireframeMaterial,
      );

      return mesh;
    }

    if (component instanceof RapierCone) {
      const radiusBottom = component.radius;
      const height = component.halfHeight * 2;
      const segments = 15;
      const mesh = new THREE.Mesh(
        new THREE.CylinderBufferGeometry(0, 2 * radiusBottom, 3 * height, segments),
        this.wireframeMaterial,
      );
      return mesh;
    }

    if (component instanceof RapierCapsule) {
      const radius = component.radius;
      const height = component.halfHeight * 2;
      const capSegments = 4;
      const radialSegments = 8;
      const mesh = new THREE.Mesh(
        new THREE.CapsuleBufferGeometry(radius, height, capSegments, radialSegments),
        this.wireframeMaterial,
      );
      return mesh;
    }

    return;
  }

  private updateColliderMesh(component: RapierCollider, mesh: THREE.Mesh) {
    if (component instanceof RapierCuboid) {
      component.object3d.getWorldScale(mesh.scale);

      mesh.scale.set(
        component.sizeOffset.x * (mesh.scale.x),
        component.sizeOffset.y * (mesh.scale.y),
        component.sizeOffset.z * (mesh.scale.z)
      );
    }

    if (component instanceof RapierBall) {
      const scale = component.object3d.scale;
      const maxSide = Math.max(scale.x, scale.y, scale.z);

      const radius = (1 + component.radiusOffset) * (maxSide);

      if (mesh.geometry instanceof THREE.SphereBufferGeometry) {
        if (mesh.geometry.parameters.radius !== radius) {
          let segments = 10 * radius;

          if (segments < 15) segments = 15;

          if (segments > 50) segments = 50;

          mesh.geometry.dispose();
          mesh.geometry = new THREE.SphereBufferGeometry(radius, segments, segments);
        }
      }
    }

    if (component instanceof RapierCylinder) {
      const radiusTop = component.radius;
      const radiusBottom = component.radius;
      component.halfHeight
      const height = component.halfHeight * 2;
      const segments = 15;

      if (mesh.geometry instanceof THREE.CylinderBufferGeometry) {
        if (
          mesh.geometry.parameters.radiusTop !== radiusTop ||
          mesh.geometry.parameters.radiusBottom !== radiusBottom ||
          mesh.geometry.parameters.height !== height ||
          mesh.geometry.parameters.radialSegments !== segments
        ) {
          mesh.geometry.dispose();
          mesh.geometry = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, segments);
        }
      }
      component.object3d.getWorldScale(mesh.scale);
    }

    if (component instanceof RapierCone) {
      const radiusBottom = component.radius;
      const height = component.halfHeight * 2;
      const segments = 15;

      if (mesh.geometry instanceof THREE.CylinderBufferGeometry) {
        if (
          mesh.geometry.parameters.radiusTop !== 0 ||
          mesh.geometry.parameters.radiusBottom !== radiusBottom ||
          mesh.geometry.parameters.height !== height ||
          mesh.geometry.parameters.radialSegments !== segments
        ) {
          mesh.geometry.dispose();
          mesh.geometry = new THREE.CylinderBufferGeometry(0, radiusBottom, height, segments);
        }
      }
      component.object3d.getWorldScale(mesh.scale);
    }

    if (component instanceof RapierCapsule) {
      const radius = component.radius;
      const height = component.halfHeight * 2;
      const capSegments = 4;
      const radialSegments = 8;

      if (mesh.geometry instanceof THREE.CapsuleBufferGeometry) {
        if (
          mesh.geometry.parameters.capSegments !== capSegments ||
          mesh.geometry.parameters.radius !== radius ||
          mesh.geometry.parameters.length !== height ||
          mesh.geometry.parameters.radialSegments !== radialSegments
        ) {
          mesh.geometry.dispose();
          mesh.geometry = new THREE.CapsuleBufferGeometry(radius, height, capSegments, radialSegments);
        }
      }
      component.object3d.getWorldScale(mesh.scale);
    }

    component.object3d.getWorldPosition(mesh.position);
    component.object3d.getWorldQuaternion(mesh.quaternion);
    // component.object3d.getWorldScale(mesh.scale);
  }

  onBeforeRemoved() {
    this.handleOnComponentAdded.stop();
    this.handleOnComponentRemoved.stop();
    this.handleOnPlay.stop();
    this.cleanupImpostors();
  }
}

RE.registerComponent(RapierBodyWireframe);

import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import RogueRapier from '../../Lib/RogueRapier';
import RapierBody from '../RapierBody.re';
import RapierWheelInfo from './RapierWheelInfo.re';

const q1 = new THREE.Quaternion();
const q2 = new THREE.Quaternion();
const up = new THREE.Vector3(0, 1, 0);

@RE.registerComponent
export default class RapierRaycastVehicleController extends RapierBody {
  static interface = {};

  @RE.props.num() mass = 14;
  _linearDamping = 0.05;
  @RE.props.num()
  get damping(): number {
    return this.linearDamping;
  }
  set damping(value: number) {
    this.linearDamping = value;
  }

  // Vehicle controls
  @RE.props.num() maxSteering = 30;
  @RE.props.num() steeringSpeed = 25;
  @RE.props.num() brakeForce = 150; // Newtons
  @RE.props.num() handbrakeForce = 300// Newtons

  // Engine properties
  @RE.props.num() redlineRPM = 6300;
  @RE.props.num() idleRPM = 800;
  @RE.props.num() maxTorque = 300; // Nm
  @RE.props.list.num() gearRatios = [-3.5, 8.5, 5.1, 4, 2.8, 2, 1.3];
  @RE.props.num() finalDriveRatio = 2.9;
  @RE.props.num(0, 1) upshift = 0.95;
  @RE.props.num(0, 1) downshift = 0.5;
  
  // Runtime values
  currentGear = 0;
  rpm = 0;
  kmh = 0;
  engineTorque = 0;

  controller: RAPIER.DynamicRayCastVehicleController;
  wheels: RapierWheelInfo[] = [];

  private WHEEL_RADIUS: number;
  private readonly METERS_TO_KMH = 3.6;

  awake() {
    RE.Input.bindAxes("Vehicle.Steer", {
      Gamepad: { x: 0, y: 1 },
      Keyboard: ["KeyW", "KeyS", "KeyA", "KeyD"]
    });
    RE.Input.bindButton("Vehicle.Accelerate", { Gamepad: 7, Keyboard: "KeyW" });
    RE.Input.bindButton("Vehicle.Reverse", { Gamepad: 6, Keyboard: "KeyS" });
    RE.Input.bindButton("Vehicle.Handbrake", { Gamepad: 1, Keyboard: "Space" });

    // Get wheel radius from first wheel
    const firstWheel = RE.getObjectComponents(this.object3d)
      .find(comp => comp instanceof RapierWheelInfo) as RapierWheelInfo;
    this.WHEEL_RADIUS = firstWheel?.radius || 0.3;
  }

  init() {
    super.init();
    this.controller = RogueRapier.world.createVehicleController(this.body);
    this.controller.setIndexForwardAxis = 2;
    this.wheels = RE.getObjectComponents(this.object3d).filter(comp => comp instanceof RapierWheelInfo);

    this.wheels.forEach((wheel, index) => {
      this.controller.addWheel(
        wheel.wheel.position,
        wheel.suspensionDirection,
        wheel.axleCs,
        wheel.suspensionRestLength,
        wheel.radius
      );

      this.controller.setWheelSuspensionStiffness(index, wheel.suspensionStiffness);
      this.controller.setWheelMaxSuspensionTravel(index, wheel.maxSuspensionTravel);
      this.controller.setWheelFrictionSlip(index, wheel.frictionSlip);
      this.controller.setWheelSideFrictionStiffness(index, wheel.sideFrictionStiffness);
      this.controller.setWheelSuspensionRelaxation(index, wheel.suspensionRelaxation);
    });
  }

  private calculateRPM(speed: number): number {
    if (this.currentGear === 0) return this.idleRPM;
    
    const gearRatio = this.gearRatios[this.getGearIndex()];
    const effectiveRatio = gearRatio * this.finalDriveRatio;
    const wheelRPS = (speed / (2 * Math.PI * this.WHEEL_RADIUS));
    return THREE.MathUtils.clamp(
      Math.abs(wheelRPS * effectiveRatio * 60),
      this.idleRPM * 0.8,
      this.redlineRPM * 1.1
    );
  }

  private updateGear() {
    const gearIndex = this.getGearIndex();
    if (gearIndex === -1) return; // Neutral

    const maxForwardGear = this.gearRatios.length - 1;

    if (gearIndex === 0) return;

    // Forward gear handling
    if (this.rpm > this.redlineRPM * this.upshift && gearIndex < maxForwardGear) {
      this.currentGear++;
    } else if (this.rpm < this.redlineRPM * this.downshift && gearIndex > 1) {
      this.currentGear--;
    }
  }

  update() {
    super.update();
    if (!this.initialized || !RogueRapier.initialized) return;

    const deltaTime = RE.Runtime.deltaTime;
    this.controller.updateVehicle(deltaTime);

    // Input handling
    const { x: steerInput } = RE.Input.getAxes("Vehicle.Steer");
    const throttle = Number(RE.Input.getPressed("Vehicle.Accelerate"));
    const reverse = Number(RE.Input.getPressed("Vehicle.Reverse"));
    const handbrake = Number(RE.Input.getPressed("Vehicle.Handbrake"));
    const steerAngle = -steerInput * THREE.MathUtils.degToRad(this.maxSteering);

    // Speed calculations
    const speed = this.controller.currentVehicleSpeed();
    this.kmh = Math.floor(Math.abs(speed) * this.METERS_TO_KMH);
    this.rpm = Math.floor(this.calculateRPM(speed));

    this.updateGear();

    // Gear management
    if (throttle && !reverse && this.currentGear !== -1) {
      this.currentGear = Math.max(1, this.currentGear);
    } else if (reverse && !throttle && this.kmh < 1) {
      this.currentGear = -1;
    } else if (this.kmh < 1) {
      this.currentGear = 0;
    }

    // Torque calculation
    const throttleInput = (throttle || reverse) ? 1 : 0;
    const torqueCurve = Math.sin(Math.PI * (this.rpm / this.redlineRPM));
    this.engineTorque = THREE.MathUtils.clamp(
      this.maxTorque * torqueCurve * throttleInput,
      0,
      this.maxTorque
    );

    // Physics calculations
    const gearIndex = this.getGearIndex();

    const gearRatio = this.gearRatios[gearIndex];
    const effectiveRatio = gearRatio * this.finalDriveRatio;
    
    // Proper reverse handling through negative ratios
    const engineForce = (this.engineTorque * effectiveRatio) / this.WHEEL_RADIUS;
    
    // Apply delta time scaled forces
    let scaledEngineForce = engineForce * deltaTime;

    // Apply forces to wheels with proper delta time scaling
    this.wheels.forEach((wheel, index) => {
      // Update wheel visuals
      const connectionPoint = this.controller.wheelChassisConnectionPointCs(index);
      const suspensionLength = this.controller.wheelSuspensionLength(index);
      const wheelRotation = this.controller.wheelRotation(index);
      
      if (connectionPoint && suspensionLength !== null) {
        wheel.wheel.position.y = connectionPoint.y - suspensionLength;
      }

      if (wheelRotation !== null) {
        q1.setFromAxisAngle(up, this.controller.wheelSteering(index) || 0);
        q2.setFromAxisAngle(this.controller.wheelAxleCs(index) as RAPIER.Vector, -wheelRotation);
        wheel.wheel.quaternion.multiplyQuaternions(q1, q2);
      }

      if (gearIndex > -1) {
        let hBrakeForce = this.handbrakeForce * wheel.handbrake;
        let brkAmnt = speed >= 0 ? reverse : throttle;
        let braking = speed !== 0 && Math.sign(speed) === Math.sign(scaledEngineForce);
        scaledEngineForce = brkAmnt > 0 && braking ? 0 : scaledEngineForce;
  
        let brakeForce = brkAmnt > 0 ? brkAmnt * this.brakeForce * wheel.brake : handbrake * hBrakeForce;
  
        wheel.traction && this.controller.setWheelEngineForce(index, scaledEngineForce);
        this.controller.setWheelBrake(index, brakeForce * RE.Runtime.deltaTime);
      }

      // Steering with delta time
      if (wheel.steer) {
        const currentSteer = this.controller.wheelSteering(index) || 0;
        const newSteer = THREE.MathUtils.lerp(
          currentSteer, 
          steerAngle, 
          deltaTime * this.steeringSpeed
        );
        this.controller.setWheelSteering(index, newSteer);
      }
    });
  }

  onRemoved() {
    if (RE.Runtime.isRunning) {
      RogueRapier.world.removeVehicleController(this.controller);
    }
  }

  getGearIndex(): number {
    if (this.currentGear === -1) return 0; // Reverse gear
    if (this.currentGear > 0) return this.currentGear; // Forward gears
    return -1; // Neutral
  }
}
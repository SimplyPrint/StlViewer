import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { Projector } from 'three/examples/jsm/renderers/Projector';

// Polyfills
three.OrbitControls = OrbitControls;
three.TrackballControls = TrackballControls;
three.Projector = Projector;

export default three;
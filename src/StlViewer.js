import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { Projector } from 'three/examples/jsm/renderers/Projector';
// Polyfills
THREE.OrbitControls = OrbitControls;
THREE.TrackballControls = TrackballControls;
THREE.Projector = Projector;

class StlViewer {
    constructor(parentElm, options) {
        this.error = null; //will contain error string, if any
        this.options = options;
        this.parent_element = parentElm;
        this.canvas_width = "100%";
        this.canvas_height = "100%";
        this.bg_color = "transparent";
        this.models_to_add = []; //at start
        this.models = new Array();
        this.models_count = 0;
        this.models_ref = new Array(); //models with index - direct reference from id(comes from user) to model array (above)
        this.allow_drag_and_drop = this.get_opt("allow_drag_and_drop", true);
        this.model_loaded_callback = null;
        this.all_loaded_callback = null;
        this.load_error_callback = null;
        this.loading_progress_callback = null;
        this.max_model_id = 0; //what is the maximum id of any model?
        this.load_status = new Array(); //loaded/total bytes info for each model
        this.load_session = 0; //usefull in more than one session of loading
        this.loaded_models_arr = new Array(); //contain ids of loaded models
        this.status = 0; //0=all good
        this.onmousedown_callback = null;
        this.zoom = -1; //-1 = auto zoom
        this.camerax = 0;
        this.cameray = 0;
        this.cameraz = 0;
        this.camera_state = null;
        this.auto_rotate = false;
        this.mouse_zoom = true;
        this.ready = (typeof THREE != 'undefined');
        this.ready_callback = null;
        this.jszip_path = null;
        this.jszip_utils_path = null;
        this.auto_resize = true;
        this.on_model_drop = null;
        this.center_models = true;
        this.controls_type = 0; //0=orbitcontrols, 1=trackbacllcontrols
        this.zoom = -1;
        this.pre_loaded_ab_files = null; //STL files as ArrayBuffer, waiting to be loaded (used when loading VSB)
        this.pre_loaded_vsj = null; //VSJ file content, waiting to be loaded (used when loading VSB)
        this.zip_load_count = -1; //Zip files waiting to be loaded to memory (used when loading VSB)
        this.send_no_model_click_event = false; //will trigger click event even if no model was clicked (just parent element was clicked)
        this.grid = null; //draw grid over scene
        this.killsign = false; //use by 'dispose', stl_viewer instqance will be unusable after setting this to true
        this.default_face_color = "#909090"; //in case of a colored model, RGB in hex

        this.is_ie = !!window.MSStream;
        //messages	
        this.MSG2WORKER_DATA = 0;
        this.MSG2WORKER_LOAD = 1;
        this.MSG2WORKER_ERROR = 2;
        this.MSGFROMWORKER_STL_LOADED = 3;
        this.MSGFROMWORKER_LOAD_IN_PROGRESS = 4;

        //THREE.JS stuff
        //world vectors
        this.WORLD_X_VECTOR = null;
        this.WORLD_Y_VECTOR = null;
        this.WORLD_Z_VECTOR = null;

        this.maxx = null;
        this.maxy = null;
        this.maxz = null;
        this.minx = null;
        this.miny = null;
        this.minz = null;
        this.edges_material = null;
        this.raycaster = null; //used for onmousedown events
        this.mouse = null; //used for onmousedown events
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.ambientLight = null;
        this.directionalLight = null;
        this.pointLight = null;
        this.controls = null;
        this.animation = new Array();

        //constructor
        this.set_options();

        //init if ready
        if (this.ready) {
            this.set_on_model_mousedown(this.onmousedown_callback);
            this.WORLD_X_VECTOR = new THREE.Vector3(1, 0, 0);
            this.WORLD_Y_VECTOR = new THREE.Vector3(0, 1, 0);
            this.WORLD_Z_VECTOR = new THREE.Vector3(0, 0, 1);

            this.edges_material = new THREE.LineBasicMaterial({ color: 0x000000 });
            this.raycaster = new THREE.Raycaster(); //used for onmousedown events
            this.mouse = new THREE.Vector2(); //used for onmousedown events

            //this.material=new THREE.MeshLambertMaterial({color:0x909090, overdraw: 1, wireframe: false, shading:THREE.FlatShading, vertexColors: THREE.FaceColors});
            this.scene = new THREE.Scene();
            this.renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true });
            this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000);
            this.parent_element.appendChild(this.renderer.domElement);
            this.scene.add(this.camera);

            this.ambientLight = new THREE.AmbientLight(0x202020);
            this.camera.add(this.ambientLight);

            this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
            this.directionalLight.position.x = 1;
            this.directionalLight.position.y = 1;
            this.directionalLight.position.z = 2;
            this.directionalLight.position.normalize();
            this.camera.add(this.directionalLight);

            this.pointLight = new THREE.PointLight(0xffffff, 0.3);
            this.pointLight.position.x = 0;
            this.pointLight.position.y = -25;
            this.pointLight.position.z = 10;
            this.camera.add(this.pointLight);

            switch (this.controls_type) {
                case 1: //TrackballControls
                    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
                    break;

                default: //OrbitControls
                    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                    this.controls.autoRotate = this.auto_rotate;
                    break;
            }

            this.init();
            if (this.ready_callback)
                this.ready_callback();
        }
    }

    get_opt(opt_id, def) {
        if (!this.options) return def;
        if (this.options[opt_id] === false) return false;
        return this.options[opt_id] ? this.options[opt_id] : def;
    }

    set_on_model_mousedown(callback) {
        this.onmousedown_callback = callback;

        if (this.onmousedown_callback) {
            this.parent_element.addEventListener('mousedown', this.onmousedown);
            this.parent_element.addEventListener('dblclick', this.onmousedown);
            this.parent_element.addEventListener('touchstart', this.onmousedown);
        }
    }

    set_drag_and_drop(b) {
        if (b) {
            this.parent_element.addEventListener('dragover', this.handleDragOver);
            this.parent_element.addEventListener('drop', this.handleFileDrop);
        }
        else {
            this.parent_element.removeEventListener('dragover', this.handleDragOver);
            this.parent_element.removeEventListener('drop', this.handleFileDrop);
        }
    }

    set_options() {
        this.canvas_width = this.get_opt("width", this.canvas_width);
        this.canvas_height = this.get_opt("height", this.canvas_height);
        this.bg_color = this.get_opt("bg_color", this.bg_color);
        this.models_to_add = this.get_opt("models", this.models_to_add);
        this.model_loaded_callback = this.get_opt("model_loaded_callback", this.model_loaded_callback);
        this.all_loaded_callback = this.get_opt("all_loaded_callback", this.all_loaded_callback);
        this.load_error_callback = this.get_opt("load_error_callback", this.load_error_callback);
        this.loading_progress_callback = this.get_opt("loading_progress_callback", this.loading_progress_callback);
        this.onmousedown_callback = this.get_opt("on_model_mousedown", this.onmousedown_callback);
        if (!this.onmousedown_callback) this.onmousedown_callback = this.get_opt("on_model_mouseclick", null);
        this.send_no_model_click_event = this.get_opt("send_no_model_click_event", this.send_no_model_click_event);
        this.zoom = this.get_opt("zoom", this.zoom); //-1 = auto zoom
        this.camerax = this.get_opt("camerax", this.camerax);
        this.cameray = this.get_opt("cameray", this.cameray);
        this.auto_rotate = this.get_opt("auto_rotate", this.auto_rotate);
        this.mouse_zoom = this.get_opt("mouse_zoom", this.mouse_zoom);
        this.ready_callback = this.get_opt("ready_callback", null);
        this.jszip_path = this.get_opt("jszip_path", null);
        this.jszip_utils_path = this.get_opt("jszip_utils_path", null);
        this.auto_resize = this.get_opt("auto_resize", this.auto_resize);
        this.on_model_drop = this.get_opt("on_model_drop", this.on_model_drop);
        this.center_models = this.get_opt("center_models", this.center_models);
        this.controls_type = this.get_opt("controls", this.controls_type);
        this.grid = this.get_opt("grid", this.grid ? true : false); //now it is boolean, later it will be grid helper object
        if (this.zoom >= 0)
            this.cameraz = this.zoom;
        else
            this.cameraz = this.get_opt("cameraz", this.cameraz);

        this.camera_state = this.get_opt("camera_state", this.camera_state);

        //drag and drop?
        if (this.allow_drag_and_drop)
            this.set_drag_and_drop(true);

        //this.set_on_model_mousedown(this.onmousedown_callback);
    }

    load_model(model) {
        this.max_model_id = Math.max(this.max_model_id, model.id);
        if ((model.filename) || (model.local_file)) return this.load_from_stl_file(model, false);
        if (model.mesh) return this.add_from_existing_mesh(model);
        this.models_count--; //WTF? no good model
    }

    add_from_existing_mesh(model) {
        this.set_model_custom_props(model); //position, color, scale
        model.mesh.model_id = model.id; //loop-back link (useful to detect clicks)
        //this.set_geo_minmax(model.mesh.geometry);
        this.set_geo_minmax(model);
        this.recalc_dims(model);

        model.color = '#' + model.mesh.material.color.getHexString();

        this.scene.add(model.mesh);
        this.model_loaded(model.id);
        this.check_loading_status(model, 0, 0);
        if (!model.mesh.geometry.boundingBox) model.mesh.geometry.computeBoundingBox();

        if (this.model_loaded_callback)
            this.model_loaded_callback(model.id);
    }

    load_from_stl_file(model) {
        let model_worker = new Worker(new URL('./worker/index.js', import.meta.url), {type: 'module'});
        let self = this;

        model_worker.onmessage = function (e) {
            if (self.killsign) {
                model_worker.terminate();
                return;
            }
            //console.log("msg from worker: ");
            //console.log(e.data);
            switch (e.data.msg_type) {
                case self.MSGFROMWORKER_STL_LOADED:
                    model.colors = e.data.colors;
                    let geo = self.vf_to_geo(e.data.vertices, e.data.faces, e.data.colors ? e.data.colors : false, model.color);
                    if (geo) {
                        //if (!geo.boundingBox) geo.computeBoundingBox();
                        //let material=new THREE.MeshLambertMaterial({color:0x909090, overdraw: 1, wireframe: false, vertexColors: model.color?THREE.NoColors:THREE.FaceColors}); //if model color is set, ignores face colors set on the STL file itself (if any)
                        let material = new THREE.MeshLambertMaterial({ color: 0x909090, wireframe: false, vertexColors: model.color ? THREE.NoColors : THREE.FaceColors }); //if model color is set, ignores face colors set on the STL file itself (if any)
                        if (!self.is_ie) material.side = THREE.DoubleSide;
                        if (!model.display) model.display = "flat";
                        self.set_material_display(model.display, material, geo); //shading (aka display)
                        model.mesh = new THREE.Mesh(geo, material);
                        self.set_model_custom_props(model); //position, color, scale
                        self.set_geo_minmax(model);
                        model.mesh.model_id = model.id; //loop-back link (useful to detect clicks)
                        self.recalc_dims(model);
                        self.scene.add(model.mesh);
                        self.model_loaded(model.id);
                        if (self.model_loaded_callback)
                            self.model_loaded_callback(model.id);
                    }
                    else
                        console.log("Error VF data ");


                    model_worker.terminate();
                    model_worker = undefined;
                    if (self.pre_loaded_ab_files) if (model.filename) if (self.pre_loaded_ab_files[model.filename]) delete (self.pre_loaded_ab_files[model.filename]);
                    break;

                case self.MSGFROMWORKER_LOAD_IN_PROGRESS:
                    self.check_loading_status(model, e.data.loaded, e.data.total);
                    break;

                case self.MSG2WORKER_ERROR:
                    //console.log('Loading error', self.load_error_callback);
                    self.models_count--; //one less model to load in self session
                    self.model_error("ERROR: " + e.data.data, self.load_error_callback);
                    if (self.pre_loaded_ab_files) if (model.filename) if (self.pre_loaded_ab_files[model.filename]) delete (self.pre_loaded_ab_files[model.filename]);
                    break;
            }
        };

        model.bytes_loaded = 0;
        model.bytes_total = 0;

        let blob_to_load = null;
        if (this.pre_loaded_ab_files) if (model.filename) if (this.pre_loaded_ab_files[model.filename]) blob_to_load = this.pre_loaded_ab_files[model.filename];

        //console.log ('blob to load', blob_to_load, this.pre_loaded_ab_files, this.pre_loaded_ab_files[model.filename]);
        model_worker.postMessage({ msg_type: this.MSG2WORKER_DATA, data: model, load_from_blob_or_ab: blob_to_load, get_progress: (this.loading_progress_callback != null), jszip_path: this.jszip_path });
        model_worker.postMessage({ msg_type: this.MSG2WORKER_LOAD });

    }

    model_loaded(model_id) {
        this.loaded_models_arr[model_id] = 1;

        if (Object.keys(this.loaded_models_arr).length >= this.models_count) {
            //all models are loaded
            if (!this.camera_state)
                this.set_zoom(); //camera state overrides zoom
            else
                this.camera_state = null; //it is one time thingy (next bunch of models will have to set camera state again)

            this.set_light();
            this.set_grid(this.grid ? true : false);

            this.load_session++; //from now on it is a new loading session

            if (this.all_loaded_callback) {
                this.all_loaded_callback();
            }
        }
    }

    set_grid(b, size, divisions) {
        if (this.grid) this.scene.remove(this.grid);
        this.grid = null;

        if (b) {
            if (!size) size = Math.max(Math.abs(this.maxx), Math.abs(this.minx)) * 2.5;
            if (size <= 0) {
                let height = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;
                let width = isNaN(window.innerWidth) ? window.clientWidth : window.innerWidth;
                size = Math.min(height, width) * 0.8;
            }
            if (!divisions) divisions = 10;
            this.grid = new THREE.GridHelper(size, divisions);
            this.scene.add(this.grid);
        }
    }

    remove_model(model_id) {
        if (this.models_ref[model_id] === undefined) return this.model_error("remove_model - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;

        this.set_or_update_geo_edges(model, false);

        delete this.models[this.models_ref[model_id]];
        delete this.models_ref[model_id];
        delete this.loaded_models_arr[model_id];

        //recalc max_model_id
        this.max_model_id = -1;
        Object.keys(this.models_ref).forEach(function (key) {
            this.max_model_id = Math.max(this.models[this.models_ref[key]].id, this.max_model_id);
        });

        this.models_count = Object.keys(this.models).length;

        this.scene.remove(model.mesh);
    }

    set_zoom(zoom, force_zoom) {
        if (zoom) this.zoom = zoom;

        //if ((this.zoom_done)&&(!force_zoom)&&(this.zoom>=0)) //don't do zoom for more than once
        if ((this.zoom_done) && (!force_zoom)) //don't do zoom for more than once
            return;

        this.zoom_done = true;

        //let max_dim = Math.max(Math.abs(this.maxx-this.minx), Math.abs(this.maxy-this.miny), Math.abs(this.maxz-this.minz));
        let cameraZ = this.zoom;
        if (this.zoom < 0) cameraZ = this.calc_z_for_auto_zoom(); //-1 = auto zoom
        this.camera.position.set(this.camera.position.x, this.camera.position.y, cameraZ);

        // set the far plane of the camera so that it easily encompasses the whole object
        const minZ = this.minz;
        const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

        this.camera.far = Math.max(cameraToFarEdge * 3000, this.camera.far);
        this.camera.updateProjectionMatrix();
        //console.log(this.camera.far);

    }

    calc_z_for_auto_zoom(offset) {
        offset = offset || 1.01;

        const boundingBox = new THREE.Box3(new THREE.Vector3(this.minx, this.miny, this.minz), new THREE.Vector3(this.maxx, this.maxy, this.maxz));
        let size = new THREE.Vector3();
        boundingBox.getSize(size);

        const fov = this.camera.fov * (Math.PI / 180);
        const fovh = 2 * Math.atan(Math.tan(fov / 2) * this.camera.aspect);
        let dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
        let dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan(fov / 2));
        let cameraZ = Math.max(dx, dy);
        cameraZ *= offset;
        return cameraZ;
    }

    //position, up and target vectors (each 3 coors vector) described camera's position
    get_camera_state() {
        if (!this.camera) return null;
        let vpos = new THREE.Vector3();
        let vup = new THREE.Vector3();
        let vtarget = new THREE.Vector3(0, 0, 0);
        vpos.copy(this.camera.position);
        vup.copy(this.camera.up);

        if (this.controls)
            vtarget.copy(this.controls.target);

        return { position: vpos, up: vup, target: vtarget }
    }

    //state{position, up, target} = x,y,z object/vector
    //all parameters are optionals
    set_camera_state(state) {
        if (!this.camera) return null;
        if (!state) return this.model_error("set_camera_state - no state vector");

        if (state.position !== undefined) {
            if (state.position.x === undefined) return this.model_error("set_camera_state - invalid position x");
            if (state.position.y === undefined) return this.model_error("set_camera_state - invalid position y");
            if (state.position.z === undefined) return this.model_error("set_camera_state - invalid position z");
            this.camera.position.set(state.position.x, state.position.y, state.position.z);
        }

        if (state.up !== undefined) {
            if (state.up.x === undefined) return this.model_error("set_camera_state invalid up x");
            if (state.up.y === undefined) return this.model_error("set_camera_state invalid up y");
            if (state.up.z === undefined) return this.model_error("set_camera_state invalid up z");
            this.camera.up.set(state.up.x, state.up.y, state.up.z);
        }

        if (!this.controls) return;

        if (state.target !== undefined) {
            if (state.target.x === undefined) return this.model_error("set_camera_state - invalid target x");
            if (state.target.y === undefined) return this.model_error("set_camera_state - invalid target y");
            if (state.target.z === undefined) return this.model_error("set_camera_state - invalid target z");
            this.controls.target.set(state.target.x, state.target.y, state.target.z);
        }
    }

    set_center_models(b) {
        this.center_models = b;
    }


    //called after set of models were loaded
    set_light() {
        this.directionalLight.position.x = this.maxy * 2;
        this.directionalLight.position.y = this.miny * 2;
        this.directionalLight.position.z = this.maxz * 2;

        this.pointLight.position.x = (this.miny + this.maxy) / 2;
        this.pointLight.position.y = (this.miny + this.maxy) / 2;
        this.pointLight.position.z = this.maxz * 2;
    }

    stop_auto_zoom() {
        this.zoom = this.camera.position.z;
        this.zoom_done = true;
    }

    set_camera(x, y, z) {
        if (y) this.zoom = y;
        //this.camera.position.set(!this.is_empty(x)?x:this.camera.position.x,!this.is_empty(y)?y:this.camera.position.y,this.zoom>=0?this.zoom:Math.max(this.maxx*3, this.maxy*3, this.maxz*3.5));
        this.camera.position.set(!this.is_empty(x) ? x : this.camera.position.x, !this.is_empty(y) ? y : this.camera.position.y, !this.is_empty(z) ? z : this.camera.position.z);
    }

    set_auto_zoom() {
        this.set_zoom(-1);
    }

    //go over ALL models for loaded/total status
    check_loading_status(model, loaded, total) {
        if (model)
            this.load_status[model.id] = { loaded: loaded, total: total, load_session: this.load_session };

        if (!this.loading_progress_callback) return; //no callback, we're done here

        //console.log(Object.keys(this.load_status).length,this.models_count);

        //if every model (loaded and pending) has loading status - send a message to parent
        if (Object.keys(this.load_status).length == this.models_count)
            this.loading_progress_callback(this.load_status, this.load_session);
    }

    set_edges(model_id, b) {
        if (this.models_ref[model_id] === undefined) return this.model_error("set_edges - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;

        this.set_or_update_geo_edges(model, b);
    }

    set_or_update_geo_edges(model, b, force_geo_recalc) {
        if ((!b) || (force_geo_recalc)) {
            if (model.edges)
                this.scene.remove(model.edges);

            model.edges = null;

            if (!b) return;
        }

        let add_to_scene = false;
        force_geo_recalc = force_geo_recalc || false;
        if ((!model.edges) || (force_geo_recalc)) {
            //no edges - create new
            let geo = model.mesh.geometry;
            model.edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), this.edges_material);
            add_to_scene = true;
        }

        //position
        if (model.x || model.y || model.z)
            model.edges.position.set(model.x ? model.x : 0, model.y ? model.y : 0, model.z ? model.z : 0);

        //rotation
        model.edges.rotation.setFromRotationMatrix(model.mesh.matrix);

        if (add_to_scene) //add only if not already added
            this.scene.add(model.edges);
    }

    //set model custome properties
    set_model_custom_props(model) {
        //units
        model.units = model.units ? model.units : 'mm';
        this.set_model_units(model.id, model.units, true);

        //position
        model.x = model.x ? model.x : 0;
        model.y = model.y ? model.y : 0;
        model.z = model.z ? model.z : 0;
        model.mesh.position.set(model.x, model.y, model.z);

        //color
        if (model.color) {
            //color for whole mesh
            this.update_mesh_color(model.mesh, model.color, false);
        }
        else if (model.colors)
            //custome colors for each face - default 'whole' body color should be white
            this.update_mesh_color(model.mesh, "#FFFFFF", true);

        //rotation
        model.rotationx = model.rotationx ? (model.rotationx) : 0;
        model.rotationy = model.rotationy ? (model.rotationy) : 0;
        model.rotationz = model.rotationz ? (model.rotationz) : 0;
        if (model.rotationx || model.rotationy || model.rotationz)
            this.set_rotation(model.id, model.rotationx, model.rotationy, model.rotationz);

        //scale
        let scale = (typeof model.scale !== 'undefined') ? model.scale : 1;
        let scalex = (typeof model.scalex !== 'undefined') ? model.scalex : scale;
        let scaley = (typeof model.scaley !== 'undefined') ? model.scaley : scale;
        let scalez = (typeof model.scalez !== 'undefined') ? model.scalez : scale;
        model.scalex = scalex;
        model.scaley = scaley;
        model.scalez = scalez;

        if ((scalex != 1) || (scaley != 1) || (scalez != 1))
            this.scale_geo(model, scalex, scaley, scalez);

        //view edges?
        if (model.view_edges)
            this.set_or_update_geo_edges(model, true);

        //opacity
        if (typeof model.opacity !== 'undefined')
            this.set_material_opacity(model.mesh.material, model.opacity);

        //animation
        if (model.animation)
            this.animation[model.id] = 1;
    }

    set_scale(model_id, scalex, scaley, scalez, keep_prev_scale) {
        if (this.models_ref[model_id] === undefined) return this.model_error("set_scale - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;
        if (!model.mesh) return;
        if (!model.mesh.geometry) return;

        let prev_scalex = Math.max(model.scalex, 0.01);
        let prev_scaley = Math.max(model.scaley, 0.01);
        let prev_scalez = Math.max(model.scalez, 0.01);

        if (scalex) model.scalex = Math.max(scalex, 0.01);
        model.scaley = Math.max(scaley ? scaley : scalex, 0.01);
        model.scalez = Math.max(scalez ? scalez : scalex, 0.01);

        this.scale_geo(model, model.scalex / prev_scalex, model.scaley / prev_scaley, model.scalez / prev_scalez);

        //if model has edges - we need to update it
        if (model.edges)
            this.set_or_update_geo_edges(model, true, true);

        //console.log(model.scalex+"/"+model.scaley+"/"+model.scalez);

        if (keep_prev_scale) //keep the previous scale (just change the geometry)
        {
            model.scalex = prev_scalex;
            model.scaley = prev_scaley;
            model.scalez = prev_scalez;
        }
    }

    scale_geo(model, scalex, scaley, scalez) {
        let geo = model.mesh.geometry;
        geo.scale(scalex, scaley, scalez);
    }

    //recalc whole scene dims, and reset camera - after adding new geometry to scene
    recalc_dims(model) {
        let geo = model.mesh.geometry;

        this.maxx = this.maxx ? (Math.max(this.maxx, geo.maxx + model.x)) : geo.maxx + model.x;
        this.maxy = this.maxy ? (Math.max(this.maxy, geo.maxy + model.y)) : geo.maxy + model.y;
        this.maxz = this.maxz ? (Math.max(this.maxz, geo.maxz + model.z)) : geo.maxz + model.z;
        this.minx = this.maxx ? (Math.min(this.minx, geo.minx + model.x)) : geo.minx + model.x;
        this.miny = this.maxy ? (Math.min(this.miny, geo.miny + model.y)) : geo.miny + model.y;
        this.minz = this.maxz ? (Math.min(this.minz, geo.minz + model.z)) : geo.minz + model.z;
    }

    //set mesh color according to 'color' let
    update_mesh_color(mesh, color, model_colors) {
        if (mesh == null) return;

        if (color == 'transparent') {
            mesh.traverse(function (object) { object.visible = false; });
            return;
        }

        mesh.traverse(function (object) { object.visible = true; });

        mesh.material.vertexColors = model_colors ? THREE.FaceColors : THREE.NoColors; //use model original face colors (from STL file)?  or user defined color (aka NoColors to specific faces)
        if ((model_colors) && (!color)) color = '#FFFFFF';

        //console.log(color, model_colors);		

        if (color)
            mesh.material.color.set(parseInt(color.substr(1), 16));

        mesh.material.needsUpdate = true;
    }

    //set color - called from outside
    set_color(model_id, color) {
        //console.log(this.models_ref, model_id, this.models_ref, this.models, this.models[0], this.models_ref[model_id]);
        if (this.models_ref[model_id] === undefined) return this.model_error("set_color - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;
        if (!model.mesh) return;

        if (color.length < 6) return;
        if (color.charAt(0) != '#') color = '#' + color;

        model.color = color;

        this.update_mesh_color(model.mesh, color, color ? false : model.colors);
    }

    //check for error in model syntax
    error_in_model(model) {
        if ((!model.id) && (model.id != 0) && (model.id != -1)) return this.model_error("missing id");
        if (!Number.isInteger(model.id)) return this.model_error("invalid id");
        if (model.id < -1) return this.model_error("id must be positive");
        if ((!model.filename) && (!model.mesh) && (!model.local_file)) {
            if (model.name)
                model.filename = model.name;
            else
                return this.model_error("missing filename or mesh");
        }
        if (this.models_ref[model.id]) return this.model_error("such model ID already exists: " + model.id);
        return null;
    }

    model_error(s, callback) {
        console.log(s);
        this.status = -1;
        this.error = s;

        if (callback)
            callback(s);

        return s;
    }

    set_bg_color(bg_color) {
        if (bg_color == 'transparent')
            this.renderer.setClearColor(0x000000, 0);
        else
            this.renderer.setClearColor(bg_color, 1);

        this.bg_color = bg_color;
    }

    set_display(model_id, display) {
        if (this.models_ref[model_id] === undefined) return this.model_error("set_display - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;

        this.set_material_display(display, model.mesh.material, model.mesh.geometry);
        model.display = display;

        if (model.mesh)
            model.mesh.normalsNeedUpdate = true;
    }

    set_opacity(model_id, opacity) {
        if (this.models_ref[model_id] === undefined) return this.model_error("set_display - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;

        model.opacity = opacity;
        this.set_material_opacity(model.mesh.material, opacity);
    }

    set_material_opacity(material, opacity) {
        if (!material) return;
        if (opacity < 1) {
            material.opacity = opacity;
            material.transparent = true;
        }
        else {
            material.opacity = 1;
            material.transparent = false;
        }
    }

    onmousedown(event) {
        event.stopPropagation();
        event.preventDefault();

        //reset click_type: 1=left click, 3=right click, 11=double click, 20=touch
        let click_type = event.which;

        switch (event.type) {
            case 'touchstart':
                click_type = 20;
                let touch = event.touches[0] || event.changedTouches[0];
                this.mouse.x = ((touch.pageX - this.parent_element.offsetLeft) / this.parent_element.clientWidth) * 2 - 1;
                this.mouse.y = - ((touch.pageY - this.parent_element.offsetTop) / this.parent_element.clientHeight) * 2 + 1;
                break;

            case 'dblclick': //double-click
                click_type = 11;
            default: //click
                this.mouse.x = ((event.clientX - this.parent_element.offsetLeft) / this.parent_element.clientWidth) * 2 - 1;
                this.mouse.y = - ((event.clientY - this.parent_element.offsetTop) / this.parent_element.clientHeight) * 2 + 1;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children);



        if (intersects.length > 0) {
            if (intersects[0].object.model_id === undefined) return;
            if (this.onmousedown_callback) {
                this.onmousedown_callback(intersects[0].object.model_id, event, intersects[0].distance, click_type);
            }
        }
        else if (this.send_no_model_click_event)
            this.onmousedown_callback(null, event, 0, click_type);
    }

    //will return if value is empty (null/undefined etc.) and not zero (which is valid)
    is_empty(a) {
        return (!a && a !== 0);
    }

    set_model_units(model_id, units, scale) {
        if (!this.models_ref || this.models_ref[model_id] === undefined) return this.model_error("set_model_units - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;
        if (!model.mesh) return;

        let scale_factor = 1;
        switch (units) {
            case 'mm':
                if (scale) if (model.units == 'inch') scale_factor = 1 / 25.4;
                model.units = 'mm';
                break;

            case 'inch':
                if (scale) if (model.units == 'mm') scale_factor = 25.4;
                model.units = 'inch';
                break;

            default:
                return this.model_error("set_model_units - invalid unit " + units);
        }

        if (scale_factor != 1) {
            this.set_scale(model.id,
                model.scalex * scale_factor,
                model.scaley * scale_factor,
                model.scalez * scale_factor,
                true //keep the current scale, just change the geometry
            );
        }
    }

    set_position(model_id, x, y, z) {
        if (this.models_ref[model_id] === undefined) return this.model_error("set_position - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;
        if (!model.mesh) return;

        model.x = (!this.is_empty(x) ? x : (model.x));
        model.y = (!this.is_empty(y) ? y : (model.y));
        model.z = (!this.is_empty(z) ? z : (model.z));

        model.mesh.position.set(model.x, model.y, model.z);

        //console.log("x/y/z: "+model.x+"/"+model.y+"/"+model.z+"/");

        //if model has edges - we need to update it
        if (model.edges)
            this.set_or_update_geo_edges(model, true, true);
    }

    set_material_display(display, material, geo) {
        switch (display.toLowerCase()) {
            case "wireframe":
                material.wireframe = true;
                break;

            case "smooth":
                material.wireframe = false;
                //material.shading=THREE.SmoothShading;
                material.flatShading = false;
                if (geo) {
                    geo.mergeVertices();
                    geo.computeVertexNormals();
                }
                break;

            case "flat":
                material.wireframe = false;
                //material.shading=THREE.FlatShading;
                material.flatShading = true;
                if (geo)
                    geo.computeFlatVertexNormals();
                break;
        }
    }

    //rotate the mesh around itself (which is relative to world, not for mesh)
    //axis_x_angel, axis_y_angel, axis_z_angel - radians - set rotation
    set_rotation(model_id, axis_x_angel, axis_y_angel, axis_z_angel, add_to_current) {
        if (this.models_ref[model_id] === undefined) return this.model_error("rotate - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;

        let c = add_to_current ? 1 : 0; //add or set angle

        if (axis_x_angel !== undefined) {
            model.rotationx = axis_x_angel + model.mesh.rotation.x * c;
            model.mesh.rotation.x = model.rotationx;
        }

        if (axis_y_angel !== undefined) {
            model.rotationy = axis_y_angel + model.mesh.rotation.y * c;
            model.mesh.rotation.y = model.rotationy;
        }

        if (axis_z_angel !== undefined) {
            model.rotationz = axis_z_angel + model.mesh.rotation.z * c;
            model.mesh.rotation.z = model.rotationz;
        }

        model.mesh.updateMatrixWorld();

        //if model has edges - we need to update it
        if (model.edges)
            this.set_or_update_geo_edges(model, true);
    }

    //rotate the mesh around itself (which is relative to world, not for mesh)
    //axis_x_angel, axis_y_angel, axis_z_angel - radians - add to current rotation
    rotate(model_id, axis_x_angel, axis_y_angel, axis_z_angel) {
        this.set_rotation(model_id, axis_x_angel, axis_y_angel, axis_z_angel, true);
    }

    //no path, with ext
    basename(filename) {
        return filename.split(/[\\/]/).pop();
    }


    get_model_filename(model, no_null, basename, skip_url) {
        let fn = null;

        if ((model.orig_url) && (!skip_url)) fn = decodeURIComponent(model.orig_url);
        else if (model.orig_filename) fn = model.orig_filename;
        else if (model.temp_filename) fn = model.temp_filename;
        else if (model.local_file) {
            if (model.local_file.name) fn = model.local_file.name;
        }
        else if (model.filename) {
            if (model.filename instanceof File) fn = File.name;
            fn = model.filename;
        }

        if (!fn) if (no_null) return 'model_' + model.id + '.stl'; //relevant for manually added meshes
        if (!fn) return null;

        if (basename) fn = this.basename(fn);

        return fn;
    }

    add_model(new_model, dont_add_to_model_count) {
        if (Array.isArray(new_model)) return this.add_models(new_model);

        if (!this.ready) {
            //THREE files not ready - queuing
            this.models_to_add.push(new_model);
            return this.model_error("THREE JS files are not ready");
        }

        let model_filename = this.get_model_filename(new_model);
        if (model_filename) {
            switch (model_filename.split('.').pop()) {
                case 'vsj':
                    return this.load_vsj(new_model.local_file ? new_model.local_file : model_filename);

                case 'vsb':
                    return this.load_vsb(new_model.local_file ? new_model.local_file : model_filename);

                //default: assumed as a regular model (STL etc.) - do nothing, continue below
            }
        }

        if (typeof (new_model.id) == 'undefined') new_model.id = -1;
        let model_error = this.error_in_model(new_model);
        if (model_error)
            return model_error;

        if (new_model.id == -1)
            new_model.id = (++this.max_model_id);

        this.models.push(new_model);
        let key = this.models.indexOf(new_model);

        if (!dont_add_to_model_count)
            if (this.models_ref[new_model.id] === undefined) this.models_count++;

        this.models_ref[new_model.id] = key;

        //console.log("id:",new_model.id, "count",this.models_count, "ref:",this.models_ref[new_model.id], dont_add_to_model_count);

        //console.log('added', new_model.id, this.models_count, this.models_ref[new_model.id]);
        this.load_model(new_model);
        return this.status;
    }

    //add models, input is array of models
    add_models(new_models) {
        if (!Array.isArray(new_models)) return this.add_model(new_models);
        this.status = 0;
        let model_keys = Object.keys(new_models);
        //this.models_count+=model_keys.length
        
        let self = this;

        //count models to load
        model_keys.forEach(function (key) {
            let model_filename = self.get_model_filename(new_models[model_keys[key]]);

            if (model_filename) {
                switch (model_filename.split('.').pop()) {
                    case 'vsj':
                    case 'vsb':
                        //do nothing
                        break;

                    default:
                        if (self.models_ref[new_models[key].id] === undefined) self.models_count++;
                }
            }
            else
                if (self.models_ref[new_models[key].id] === undefined) self.models_count++;
        });

        //add model by model
        model_keys.forEach(function (key) {
            self.add_model(new_models[key], true);
        });

        return this.status;
    }

    calc_volume_and_area(geo, factor) {
        let x1, x2, x3, y1, y2, y3, z1, z2, z3, i;
        let len = geo.faces.length;
        let totalVolume = 0;
        let totalArea = 0;
        let a, b, c, s;

        for (let i = 0; i < len; i++) {
            x1 = geo.vertices[geo.faces[i].a].x * factor;
            y1 = geo.vertices[geo.faces[i].a].y * factor;
            z1 = geo.vertices[geo.faces[i].a].z * factor;
            x2 = geo.vertices[geo.faces[i].b].x * factor;
            y2 = geo.vertices[geo.faces[i].b].y * factor;
            z2 = geo.vertices[geo.faces[i].b].z * factor;
            x3 = geo.vertices[geo.faces[i].c].x * factor;
            y3 = geo.vertices[geo.faces[i].c].y * factor;
            z3 = geo.vertices[geo.faces[i].c].z * factor;

            totalVolume +=
                (-x3 * y2 * z1 +
                    x2 * y3 * z1 +
                    x3 * y1 * z2 -
                    x1 * y3 * z2 -
                    x2 * y1 * z3 +
                    x1 * y2 * z3);

            a = geo.vertices[geo.faces[i].a].distanceTo(geo.vertices[geo.faces[i].b]) * factor;
            b = geo.vertices[geo.faces[i].b].distanceTo(geo.vertices[geo.faces[i].c]) * factor;
            c = geo.vertices[geo.faces[i].c].distanceTo(geo.vertices[geo.faces[i].a]) * factor;
            s = (a + b + c) / 2;
            totalArea += Math.sqrt(s * (s - a) * (s - b) * (s - c));
        }

        return [Math.abs(totalVolume / 6), totalArea, geo.faces.length];
    }

    get_model_info(model_id) {
        if (this.models_ref[model_id] === undefined) return this.model_error("get_model_info - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];

        if (!model) return null;
        if (!model.mesh) return null;
        if (!model.mesh.geometry) return null;

        let vol_and_area = model.mesh.geometry ? this.calc_volume_and_area(model.mesh.geometry, model.units == 'inch' ? 1 / 25.4 : 1) : [0, 0, 0];
        return { name: model.filename ? model.filename : (model.local_file ? model.local_file.name : ""), orig_filename: model.orig_filename ? model.orig_filename : null, position: { x: model.x, y: model.y, z: model.z }, dims: { x: model.mesh.geometry.maxx - model.mesh.geometry.minx, y: model.mesh.geometry.maxy - model.mesh.geometry.miny, z: model.mesh.geometry.maxz - model.mesh.geometry.minz }, rotation: { x: model.mesh.rotation.x, y: model.mesh.rotation.y, z: model.mesh.rotation.z }, display: model.display ? model.display : null, color: model.color ? model.color : null, scale: { x: model.scalex, y: model.scaley, z: model.scalez }, volume: vol_and_area[0], area: vol_and_area[1], triangles: vol_and_area[2], units: model.units, opacity: model.opacity !== undefined ? model.opacity : 1 };
    }

    get_vsb() {
        let files_arr = []; //array of model binary data (as arraybuffer)
        let self = this;

        Object.keys(this.models_ref).forEach(function (key) {
            files_arr.push({ id: key, bin: self.get_stl_bin(key) });
        });

        //console.log(files_arr);
        //console.log(this.get_vsj(true));

        return { vsj: this.get_vsj(true, true, true), files: files_arr };
    }

    get_vsj(as_js_obj, force_basename, for_vsb) {
        //get object info in json format
        let pos = this.camera.position;
        let data = { canvas_height: this.canvas_height, bg_color: this.bg_color, camera_state: this.get_camera_state(), auto_rotate: this.auto_rotate, mouse_zoom: this.mouse_zoom, auto_resize: this.auto_resize, center_models: this.center_models };
        if (this.grid) data['grid'] = 1;
        data['models'] = [];

        Object.keys(this.models_ref).forEach(function (key) {
            let model = this.models[this.models_ref[key]];
            let info = { id: for_vsb ? -1 : model.id };

            if (for_vsb) {
                //console.log(model);
                //let curr_filename=this.get_model_filename(model, true, true, true);
                //if (curr_filename) info['filename']=curr_filename;
                info['filename'] = model.id + '.stl';
            }
            else {
                let curr_filename = this.get_model_filename(model, true, force_basename);
                if (curr_filename) info['filename'] = curr_filename;
                if (model.local_file) info['local_file'] = model.local_file;
            }

            if (model.x) info['x'] = model.x;
            if (model.y) info['y'] = model.y;
            if (model.z) info['z'] = model.z;
            if (model.display) info['display'] = model.display;
            if (!((model.colors) && (model.color == '#ffffff'))) if (model.color) info['color'] = model.color; //if model is colored stl and the color is #FFFFFF, skip color property (cause this is the defauly for colored STL)
            if (model.units) info['units'] = model.units;
            if (model.rotationx) info['rotationx'] = model.rotationx;
            if (model.rotationy) info['rotationy'] = model.rotationy;
            if (model.rotationz) info['rotationz'] = model.rotationz;
            if ((model.scale !== undefined) && (!for_vsb)) if (model.scale != 1) info['scale'] = model.scale;
            if ((model.scalex != 1) && (!for_vsb)) info['scalex'] = model.scalex; //in vsb the scale will always be 1, in order to skip scaling when the vsb will be loaded (to avoid double scaling as the geometry is already scalled)
            if ((model.scaley != 1) && (!for_vsb)) info['scaley'] = model.scaley;
            if ((model.scalez != 1) && (!for_vsb)) info['scalez'] = model.scalez;
            if (model.opacity !== undefined) if (model.opacity != 1) info['opacity'] = model.opacity;
            if (model.view_edges) info['view_edges'] = model.view_edges;
            if (model.animation) {
                info['animation'] = JSON.parse(JSON.stringify(model.animation)); //clone
                delete info['animation'].start_time;
                delete info['animation'].last_time;
            }

            //data['models'].push(info);
            data['models'][this.models_ref[key]] = info;


        });

        return as_js_obj ? data : this.json_without_nulls(data);
    }

    download_vsj(filename) {
        let blob = new Blob([this.get_vsj()], { type: "application/json" });
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        let download_name = filename ? filename : "1";
        let p = download_name.toLowerCase().indexOf('.vsj');
        if (p >= 0) download_name = download_name.substring(0, p);
        if (download_name.length < 1) download_name = '1';

        if (window.navigator.msSaveOrOpenBlob) {
            //only for IE
            window.navigator.msSaveBlob(blob, download_name + '.vsj');
            return;
        }

        link.download = download_name + '.vsj';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    load_vsj(filename) {
        if (!filename) {
            //not filename, check if VSJ is in memory
            if (this.pre_loaded_vsj) {
                stl_viewer.init_by_json(this.pre_loaded_vsj);
                this.pre_loaded_vsj = null;
                return true;
            }

            return this.model_error("load_vsj - invalid filename" + filename, this.load_error_callback);
        }

        if (filename instanceof File) {
            //a local file - as text, then pass it to init_by_json
            return this.read_bin_file(filename, this.init_by_json, null, true);
        }

        //a url - load scene from vsj file
        let xhr = new XMLHttpRequest();

        let self = this;

        xhr.onreadystatechange =
            function (e) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        self.init_by_json(xhr.response.trim());
                    }
                }
            }

        xhr.open("GET", filename, true);
        xhr.send(null);
    }


    padend(s, targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (s.length > targetLength) {
            return String(s);
        }
        else {
            targetLength = targetLength - s.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return String(s) + padString.slice(0, targetLength);
        }
    }

    get_normal(v1, v2, v3) {
        let u = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
        let v = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };

        let n = { x: 0, y: 0, z: 0 };
        n.x = u.y * v.z - u.z * v.y;
        n.y = u.z * v.x - u.x * v.z;
        n.z = u.x * v.y - u.y * v.x;

        //normalize
        let div_val = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
        if (div_val != 0) {
            n.x /= div_val;
            n.y /= div_val;
            n.z /= div_val;
        }

        return (n);
    }

    get_stl_bin(model_id) {
        if (this.models_ref[model_id] === undefined) return this.model_error("get_stl_bin - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;
        if (!model.mesh) return;

        let geo = model.mesh.geometry;
        if (!geo) return;

        let a = new ArrayBuffer(80 + 4 + geo.faces.length * 50);
        let d = new DataView(a);

        let enc = new TextEncoder();

        let s = this.padend(('Binary' + (model.colors ? ' colored' : '') + ' STL by viewstl.com'), 80, ' ');
        for (let i = 0; i < 80; i++) {
            d.setUint8(i, s.charCodeAt(i), true);
        }

        d.setUint32(80, geo.faces.length, true);

        let pos = 84;
        Object.keys(geo.faces).forEach(function (face_key) {
            let fdata = geo.faces[face_key];
            let v1 = geo.vertices[fdata.a];
            let v2 = geo.vertices[fdata.b];
            let v3 = geo.vertices[fdata.c];
            let color = 1;
            let n = this.get_normal(v1, v2, v3);

            //console.log(v1.x, v1.x.toString(2));

            //normal
            d.setFloat32(pos, n.x, true); pos += 4;
            d.setFloat32(pos, n.y, true); pos += 4;
            d.setFloat32(pos, n.z, true); pos += 4;

            //vertex1
            d.setFloat32(pos, v1.x, true); pos += 4;
            d.setFloat32(pos, v1.y, true); pos += 4;
            d.setFloat32(pos, v1.z, true); pos += 4;

            //vertex2
            d.setFloat32(pos, v2.x, true); pos += 4;
            d.setFloat32(pos, v2.y, true); pos += 4;
            d.setFloat32(pos, v2.z, true); pos += 4;

            //vertex3
            d.setFloat32(pos, v3.x, true); pos += 4;
            d.setFloat32(pos, v3.y, true); pos += 4;
            d.setFloat32(pos, v3.z, true); pos += 4;

            //color (?)
            if (model.colors)
                d.setUint16(pos, Math.ceil(fdata.color.r * 31) | (Math.ceil(fdata.color.g * 31) << 5) | (Math.ceil(fdata.color.b * 31) << 10), true);
            else
                d.setUint16(pos, 0, true);

            pos += 2;

        });

        return a;
    }

    basename(str) {
        return str.substr(str.lastIndexOf('/') + 1);
    }

    json_without_nulls(arr) {
        return JSON.stringify(arr).split(",null").join("").split("null,").join("");
    }
    
    read_bin_file(f, after_read_func, prog_func, as_text) {
        let reader = new FileReader();

        reader.onerror = function (e) {
            console.log("reading file error", e);
            return null;
        }

        reader.onload = function (e) {
            //return after_read_func(e.target.result, filename);
            return after_read_func(e.target.result);
        };

        if (prog_func) {
            reader.onprogress = function (e) {
                prog_func({ loaded: e.loaded, total: e.total, load_session: -1 }, -1);
            };
        }

        if (as_text)
            reader.readAsText(f);
        else
            reader.readAsArrayBuffer(f);
    }

    download_model(model_id, filename) {
        if (this.models_ref[model_id] === undefined) return this.model_error("download_model - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;
        if (!model.mesh) return;

        let blob = new Blob([this.get_stl_bin(model_id)], { type: "application/sla" });
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        //let download_name=filename?filename:(model.filename?model.filename:(model.local_file?model.local_file.name:"1"));
        let download_name = this.get_model_filename(model, true, true, true);

        let p = download_name.toLowerCase().indexOf('.stl');
        if (p >= 0) download_name = download_name.substring(0, p);
        if (download_name.length < 1) download_name = '1';

        if (window.navigator.msSaveOrOpenBlob) {
            //only for IE
            window.navigator.msSaveBlob(blob, download_name + '.stl');
            return;
        }

        link.download = download_name + '.stl';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    get_model_mesh(model_id) {
        if (this.models_ref[model_id] === undefined) return this.model_error("get_model_mesh - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;
        if (!model.mesh) return;

        let mesh = model.mesh.clone();
        mesh.geometry = model.mesh.geometry.clone();
        mesh.material = model.mesh.material.clone();
        return mesh;
    }


    set_auto_rotate(b) {
        this.controls.autoRotate = b;
    }

    set_mouse_zoom(b) {
        this.controls.noZoom = !b;
    }


    do_resize() {
        if (!this.parent_element) return;
        let r = this.parent_element.getBoundingClientRect();
        //let r=this.parent_element.children[0].getBoundingClientRect();
        let rsize_width = r.width;
        let rsize_height = r.height;

        this.camera.aspect = rsize_width / rsize_height;
        this.camera.updateProjectionMatrix();
        //this.renderer.setSize(rsize_width-5, rsize_height-5);
        this.renderer.setSize(rsize_width, rsize_height);
    }

    animate() {
        if (this.killsign) return;
        Object.keys(this.animation).forEach(function (key) {
            if (!(this.models_ref[key] === undefined))
                this.do_model_animation(this.models[this.models_ref[key]]);
        });

        let self = this;

        requestAnimationFrame((e) => {
            if(self.animate) self.animate(e);
        });

        if (this.renderer)
            this.renderer.render(this.scene, this.camera);

        if (this.controls)
            this.controls.update();
    }

    //called by animate
    do_model_animation(model) {
        //console.log('animation '+model+animation);
        if (!model.animation) return;

        let curr_time = Date.now();
        if (!model.animation.start_time) model.animation.start_time = curr_time;

        if (model.animation.delta) {
            let p = (curr_time - model.animation.start_time) / model.animation.delta.msec; //percentage
            let p_from_last_time = model.animation.last_time ? ((curr_time - model.animation.last_time) / model.animation.delta.msec) : p;
            this.animation_next_delta(model, model.animation.delta, p_from_last_time);

            if (p >= 1) {
                if (!model.animation.delta.loop) {
                    this.remove_model_animation(model, true);
                    return;
                }
                else
                    //loop - start over
                    model.animation.delta.start_time = null;
            }
        }

        if (model.animation.exact) {
            let p_from_last_time = (curr_time - (model.animation.last_time ? (model.animation.last_time) : (model.animation.start_time))) / model.animation.exact.msec;
            this.animation_next_exact(model, model.animation.exact, p_from_last_time);

            if (curr_time >= model.animation.start_time + model.animation.exact.msec) {
                this.remove_model_animation(model, false, true);
                return;
            }
        }


        model.animation.last_time = curr_time;
    }

    //increments values during animation
    animation_next_delta(model, a_data, inc_const) {
        let done_position = false;
        let done_rotation = false;
        let done_scale = false;
        Object.keys(a_data).forEach(function (key) {
            switch (key) {
                case 'x':
                case 'y':
                case 'z':
                    if (!done_position) //we'll do all x/y/z at once (and one time ...)
                    {
                        done_position = true;
                        this.set_position(model.id,
                            model.x + ((a_data.x !== undefined) ? (a_data.x * inc_const) : 0),
                            model.y + ((a_data.y !== undefined) ? (a_data.y * inc_const) : 0),
                            model.z + ((a_data.z !== undefined) ? (a_data.z * inc_const) : 0)
                        );
                    }
                    break;

                case 'rotationx':
                case 'rotationy':
                case 'rotationz':
                    if (!done_rotation) //we'll do all x/y/z at once (and one time ...)
                    {
                        done_rotation = true;
                        this.rotate(model.id,
                            ((a_data.rotationx !== undefined) ? (a_data.rotationx * inc_const) : 0),
                            ((a_data.rotationy !== undefined) ? (a_data.rotationy * inc_const) : 0),
                            ((a_data.rotationz !== undefined) ? (a_data.rotationz * inc_const) : 0)
                        );
                    }
                    break;

                case 'scale':
                case 'scalex':
                case 'scaley':
                case 'scalez':
                    if (!done_scale) //we'll do all x/y/z at once (and one time ...)
                    {
                        done_scale = true;
                        a_data.scalex = a_data.scalex ? a_data.scalex : (a_data.scale ? a_data.scale : null);
                        a_data.scaley = a_data.scaley ? a_data.scaley : (a_data.scale ? a_data.scale : null);
                        a_data.scalez = a_data.scalez ? a_data.scalez : (a_data.scale ? a_data.scale : null);
                        this.set_scale(model.id,
                            model.scalex + ((a_data.scalex !== undefined) ? (a_data.scalex * inc_const) : 0),
                            model.scaley + ((a_data.scaley !== undefined) ? (a_data.scaley * inc_const) : 0),
                            model.scalez + ((a_data.scalez !== undefined) ? (a_data.scalez * inc_const) : 0)
                        );
                    }
                    break;

            }
        });
    }

    animation_next_exact(model, a_data, p_from_last_time) {
        let done_position = false;
        let done_rotation = false;
        let done_scale = false;
        Object.keys(a_data).forEach(function (key) {
            switch (key) {
                case 'x':
                case 'y':
                case 'z':
                    if (!done_position) //we'll do all x/y/z at once (and one time ...)
                    {
                        done_position = true;
                        if (a_data.xtotal === undefined) a_data.xtotal = a_data.x - model.x;
                        if (a_data.ytotal === undefined) a_data.ytotal = a_data.y - model.y;
                        if (a_data.ztotal === undefined) a_data.ztotal = a_data.z - model.z;
                        this.set_position(model.id,
                            model.x + ((a_data.x !== undefined) ? (a_data.xtotal * p_from_last_time) : 0),
                            model.y + ((a_data.y !== undefined) ? (a_data.ytotal * p_from_last_time) : 0),
                            model.z + ((a_data.z !== undefined) ? (a_data.ztotal * p_from_last_time) : 0)
                        );
                    }
                    break;

                case 'rotationx':
                case 'rotationy':
                case 'rotationz':
                    if (!done_rotation) //we'll do all x/y/z at once (and one time ...)
                    {
                        done_rotation = true;
                        let rot = model.mesh.getWorldRotation();
                        if (a_data.rotxtotal === undefined) a_data.rotxtotal = a_data.rotationx - rot.x;
                        if (a_data.rotytotal === undefined) a_data.rotytotal = a_data.rotationy - rot.y;
                        if (a_data.rotztotal === undefined) a_data.rotztotal = a_data.rotationz - rot.z;
                        this.rotate(model.id,
                            ((a_data.rotationx !== undefined) ? (a_data.rotxtotal * p_from_last_time) : 0),
                            ((a_data.rotationy !== undefined) ? (a_data.rotytotal * p_from_last_time) : 0),
                            ((a_data.rotationz !== undefined) ? (a_data.rotztotal * p_from_last_time) : 0)
                        );
                    }
                    break;

                case 'scale':
                case 'scalex':
                case 'scaley':
                case 'scalez':
                    if (!done_scale) //we'll do all x/y/z at once (and one time ...)
                    {
                        done_scale = true;
                        a_data.scalex = a_data.scalex ? a_data.scalex : (a_data.scale ? a_data.scale : null);
                        a_data.scaley = a_data.scaley ? a_data.scaley : (a_data.scale ? a_data.scale : null);
                        a_data.scalez = a_data.scalez ? a_data.scalez : (a_data.scale ? a_data.scale : null);
                        if (a_data.scalextotal === undefined) a_data.scalextotal = a_data.scalex - model.scalex;
                        if (a_data.scaleytotal === undefined) a_data.scaleytotal = a_data.scaley - model.scaley;
                        if (a_data.scaleztotal === undefined) a_data.scaleztotal = a_data.scalez - model.scalez;
                        this.set_scale(model.id,
                            model.scalex + ((a_data.scalex !== undefined) ? (a_data.scalextotal * p_from_last_time) : 0),
                            model.scaley + ((a_data.scaley !== undefined) ? (a_data.scaleytotal * p_from_last_time) : 0),
                            model.scalez + ((a_data.scalez !== undefined) ? (a_data.scaleztotal * p_from_last_time) : 0)
                        );
                    }
                    break;

            }
        });
    }

    remove_model_animation(model, remove_delta, remove_exact) {
        if (remove_delta)
            //remove delta part only
            model.animation.delta = null;

        if (remove_exact)
            //remove exact part only
            model.animation.exact = null;

        if ((model.animation.delta) || (model.animation.exact)) return;

        model.animation = null;
        //this.animation[model.id]=0;
        delete this.animation[model.id];
    }

    animate_model(model_id, animation) {
        if (this.models_ref[model_id] === undefined) return this.model_error("animate-model - id not found: " + model_id);

        let model = this.models[this.models_ref[model_id]];
        if (!model) return;

        if (!animation) return this.remove_model_animation(model, true, true);

        model.animation = JSON.parse(JSON.stringify(animation)); //cloning the animation object

        if (model.animation.delta) if (!model.animation.delta.msec) model.animation.delta.msec = 300;
        if (model.animation.exact) if (!model.animation.exact.msec) model.animation.exact.msec = 300;
        this.animation[model_id] = 1;
    }


    init() {
        this.set_bg_color(this.bg_color);

        if (this.mouse_zoom === false)
            this.set_mouse_zoom(this.mouse_zoom);

        if (this.camera_state)
            this.set_camera_state(this.camera_state);
        else
            this.camera.position.set(this.camerax, this.cameray, this.cameraz);

        this.do_resize();


        //start action
        if (this.models_to_add) {
            this.add_models(this.models_to_add);
        }

        this.set_auto_resize(this.auto_resize);

        this.animate();
    }

    set_auto_resize(b) {
        if (!this.do_resize) return;

        window.removeEventListener('resize', this.do_resize);

        if (b)
            window.addEventListener('resize', this.do_resize);

    }

    vf_to_geo(vertices, faces, colors, default_face_color) {
        if (!vertices) return null;
        if (!faces) return null;

        let geo_vertices = [];
        let geo_faces = [];

        let len = vertices.length;

        for (let i = 0; i < len; i++) geo_vertices.push(new THREE.Vector3(vertices[i][0], vertices[i][1], vertices[i][2]));

        len = faces.length;

        if (!colors) {
            for (let i = 0; i < len; i++)
                geo_faces.push(new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]));
        }
        else {
            for (let i = 0; i < len; i++) {
                let face = new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]);
                if (typeof faces[i][3] === "undefined") {
                    if (!default_face_color) default_face_color = this.default_face_color; //if user didn't define model color, it will take the default value. since model is colored (if we're here) - we have to give each face a color, or it will appear black
                    face.color.setRGB(parseInt(this.default_face_color.substr(1, 2), 16) / 255, parseInt(this.default_face_color.substr(3, 2), 16) / 255, parseInt(this.default_face_color.substr(5, 2), 16) / 255);
                }
                else
                    face.color.setRGB(faces[i][3], faces[i][4], faces[i][5]);
                geo_faces.push(face);
            }
        }


        let geo = new THREE.Geometry();
        geo.vertices = geo_vertices;
        geo.faces = geo_faces;
        geo.computeBoundingBox();
        geo.computeFaceNormals();
        geo.computeVertexNormals();

        if (this.center_models)
            geo.center(geo);

        //this.set_geo_minmax(geo);

        return (geo);
    }

    //calc min/max positions for a geometry - useful
    set_geo_minmax(model) {
        let geo = model.mesh.geometry;
        if (geo.boundingBox) {
            geo.minx = geo.boundingBox.min.x;
            geo.miny = geo.boundingBox.min.y;
            geo.minz = geo.boundingBox.min.z;
            geo.maxx = geo.boundingBox.max.x;
            geo.maxy = geo.boundingBox.max.y;
            geo.maxz = geo.boundingBox.max.z;
        }
        else {
            let vertices = geo.vertices;
            let minx = vertices[0].x;
            let miny = vertices[0].y;
            let minz = vertices[0].z;
            let maxx = vertices[0].x;
            let maxy = vertices[0].y;
            let maxz = vertices[0].z;

            let i = vertices.length;
            while (i--) {
                if (vertices[i].x < minx) minx = vertices[i].x;
                if (vertices[i].y < miny) miny = vertices[i].y;
                if (vertices[i].z < minz) minz = vertices[i].z;
                if (vertices[i].x > maxx) maxx = vertices[i].x;
                if (vertices[i].y > maxy) maxy = vertices[i].y;
                if (vertices[i].z > maxz) maxz = vertices[i].z;
            }
            geo.minx = minx + model.x;
            geo.miny = miny + model.y;
            geo.minz = minz + model.z;
            geo.maxx = maxx + model.x;
            geo.maxy = maxy + model.y;
            geo.maxz = maxz + model.z;
        }
    }

    //drag and drop
    handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleFileDrop(e) {
        e.stopPropagation();
        e.preventDefault();

        //first, check if its a file
        if (e.dataTransfer.files.length > 0) {
            this.load_local_files(e.dataTransfer.files);
        }

        else if (typeof e.dataTransfer.getData("Text") === 'string') {
            //check - maybe a url?
            this.add_model({ id: -1, filename: e.dataTransfer.getData("Text") });
            if (this.on_model_drop) this.on_model_drop(e.dataTransfer.getData("Text"));
        }
    }

    load_local_files(files) {
        //first, check if its a file
        if (files.length > 0) {
            let dropped_models = new Array();
            let len = files.length;
            for (let i = 0; i < len; i++) {
                switch (files[i].name.split('.').pop()) {
                    case 'vsj':
                        this.load_vsj(files[i]);
                        break;

                    case 'vsb':
                        this.load_vsb(files[i]);
                        break;

                    default:
                        //assumed as a regular model (STL etc.)
                        dropped_models.push({ id: -1, local_file: files[i] });
                }

                if (this.on_model_drop) this.on_model_drop(files[i].name);
            }
            this.add_models(dropped_models);

        }
    }

    clean() {
        this.models = null; this.models = [];
        this.models_count = 0;
        this.models_ref = null; this.models_ref = [];
        this.max_model_id = 0;
        this.load_status = null; this.load_status = [];
        this.load_session = 0;
        this.loaded_models_arr = null; this.loaded_models_arr = [];
        this.animation = null; this.animation = [];
        this.models_to_add = null; this.models_to_add = [];
        this.options.models = null;


        if (!this.scene) return;
        let scene = this.scene;
        let i = scene.children.length;
        while (i--) {
            if (scene.children[i].type === 'Mesh') {
                scene.children[i].geometry.dispose();
                scene.children[i].material.dispose();
                scene.remove(scene.children[i]);
            }
        }

        //remove edges for each model
        Object.keys(this.models_ref).forEach(function (key) {
            this.set_or_update_geo_edges(this.models[this.models_ref[key]], false);
        });


        //this.camera.position.set(this.camerax,this.cameray,this.cameraz);

        this.renderer.renderLists.dispose();
    }

    reset_parent_element(parent_element_obj) {
        this.parent_element = parent_element_obj;
        if (this.allow_drag_and_drop)
            this.set_drag_and_drop(true);

        this.set_on_model_mousedown(this.onmousedown_callback);

        this.parent_element.appendChild(this.renderer.domElement);
    }

    external_files_loaded() {
        this.ready = true;
        this.init();
        if (this.ready_callback)
            this.ready_callback();
    }

    init_by_json(json_str) {
        let data = null;
        try {
            data = JSON.parse(json_str);
        }
        catch (err) {
            console.log('json error ', json_str);
            return false;
        }

        this.options = data;

        this.set_options();

        if (this.ready)
            this.init();
    }

    dispose() {
        this.killsign = true; //not to render anymore
        //clean object's references (and let brower's GC do it work)
        this.clean();

        if (this.renderer) //one last render (to clean it all)
            this.renderer.render(this.scene, this.camera);

        if (this.controls)
            this.controls.update();

        this.animate = null;
        this.animation = null;
        this.error = null;
        this.options = null;
        this.parent_element = null;
        this.models_to_add = null;
        this.models = null;
        this.models_ref = null;
        this.model_loaded_callback = null;
        this.all_loaded_callback = null;
        this.load_error_callback = null;
        this.loading_progress_callback = null;
        this.load_status = null;
        this.loaded_models_arr = null;
        this.onmousedown_callback = null;
        this.camera_state = null;
        this.ready_callback = null;
        this.on_model_drop = null;
        this.pre_loaded_ab_files = null;
        this.pre_loaded_vsj = null;
        this.grid = null;
        this.WORLD_X_VECTOR = null;
        this.WORLD_Y_VECTOR = null;
        this.WORLD_Z_VECTOR = null;
        this.edges_material = null;
        this.raycaster = null;
        this.mouse = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.ambientLight = null;
        this.directionalLight = null;
        this.pointLight = null;
        this.controls = null;
    }
}

// module.exports = StlViewer;
global.StlViewer = StlViewer;
global.THREE = THREE;
export default StlViewer;
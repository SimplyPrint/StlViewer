import { parse_3d_file } from './parser';

//1.13
//load STL file info geometry and returns it
const MSG_DATA = 0;
const MSG_LOAD = 1;
const MSG_ERROR = 2;
const MSG_STL_LOADED = 3;
const MSG_LOAD_IN_PROGRESS = 4;

let filename = null;
let local_file = null;
let load_from_blob_or_ab = null; //from ArrayBuffer
let x = 0;
let y = 0;
let z = 0;
let model_id = -1;
let get_progress = false;

onmessage = function (e) {
    switch (e.data.msg_type) {
        case MSG_DATA:
            if (!e.data.data) { send_error("no data"); break; }
            if ((!e.data.data.filename) && (!e.data.data.local_file)) { send_error("no file"); break; }

            if (e.data.data.local_file) {
                filename = e.data.data.local_file.name ? e.data.data.local_file.name : e.data.data.filename; //filename property is usefull for blob files, 10x Fraser
                local_file = e.data.data.local_file ? e.data.data.local_file : null;
            }
            else if (e.data.data.filename)
                filename = e.data.data.filename;

            if (e.data.data.x) if (isNumeric(e.data.data.x)) x = e.data.data.x;
            if (e.data.data.y) if (isNumeric(e.data.data.y)) y = e.data.data.y;
            if (e.data.data.y) if (isNumeric(e.data.data.z)) z = e.data.data.z;

            load_from_blob_or_ab = null;
            if (e.data.load_from_blob_or_ab)
                load_from_blob_or_ab = e.data.load_from_blob_or_ab;

            model_id = e.data.data.id ? e.data.data.id : -1;
            get_progress = e.data.get_progress ? e.data.get_progress : false;

            break;

        case MSG_LOAD:
            if (load_from_blob_or_ab) {
                //blob/arraybuffer ready to be parsed
                if (load_from_blob_or_ab instanceof ArrayBuffer) after_file_load(load_from_blob_or_ab); //arraybuffer
                else read_file(load_from_blob_or_ab); //blob

            }
            else if (local_file)
                //local server file (not to confuse with local computer file)
                read_file(local_file);

            else if (filename)
                //url file (assuming accessible for this domain (if NOT, get help here - https://www.viewstl.com/local_url/)
                download_from_local(filename);

            break;

        default:
            console.log("invalid msg: " + e.data.msg_type);

    }
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function send_error(s) {
    postMessage({ msg_type: MSG_ERROR, data: s });
}

function download_from_local(filename) {
    if ((fetch)) {
        download_from_local_fetch(filename);
    }
    else {
        download_from_local_xhr(filename);
    }
}

function download_from_local_xhr(filename) {
    let xhr = new XMLHttpRequest();

    if (get_progress) {
        xhr.onprogress =
            function (e) {
                postMessage({ msg_type: MSG_LOAD_IN_PROGRESS, id: model_id, loaded: e.loaded, total: e.total });
            }
    }

    xhr.onreadystatechange =
        function (e) {
            if (xhr.readyState == 4) {
                //console.log('status: '+xhr.status);
                if (xhr.status == 200) {
                    //console.log('done');
                    after_file_load(xhr.response);
                }
            }
        }

    xhr.open("GET", filename, true);
    //xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.responseType = "arraybuffer";

    xhr.send(null);
}

async function download_from_local_fetch(filename) {
    const response = await fetch(filename, {method: 'GET', credentials: 'include'});
    let chunksAll;

    if (response.body.getReader) {
        function typedArrayToBuffer(array) {
            return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
        }

        let chunks = [];
    
        let receivedLength = 0;
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            chunks.push(value);
            receivedLength += value.length;
            postMessage({ msg_type: MSG_LOAD_IN_PROGRESS, id: model_id, loaded: receivedLength, total: contentLength });
        }

        chunksAll = new Uint8Array(receivedLength); // (4.1)

        let position = 0;
        for (let chunk of chunks) {
            chunksAll.set(chunk, position); // (4.2)
            position += chunk.length;
        }

        chunksAll = typedArrayToBuffer(chunksAll);
    } else {
        chunksAll = await response.arrayBuffer();
    }

    after_file_load(chunksAll);
}

function after_file_load(s) {
    let vf_data;

    if (!s) {
        send_error("no data");
        return;
    }

    try {
        vf_data = parse_3d_file(filename, s, after_file_parse);
    }
    catch (err) {
        console.log(err);
        send_error("Error parsing the file");
        return;
    }


    /*if (typeof vf_data === 'string') {
        send_error(vf_data);
        return;
    }

    postMessage({ msg_type: MSG_STL_LOADED, vertices: vf_data.vertices, faces: vf_data.faces, colors: vf_data.colors });*/
}

function after_file_parse(vf_data) {
    if (typeof vf_data === 'string') {
        send_error(vf_data);
        return;
    }

    postMessage({ msg_type: MSG_STL_LOADED, vertices: vf_data.vertices, faces: vf_data.faces, colors: vf_data.colors });
}


function read_file(f) {
    let reader = new FileReader();

    reader.onerror = function (e) {
        let error_str = "";
        switch (e.target.error.code) {
            case e.target.error.NOT_FOUND_ERR:
                error_str = "File not found";
                break;

            case e.target.error.NOT_READABLE_ERR:
                error_str = "Can't read file - too large?";
                break;

            case e.target.error.ABORT_ERR:
                error_str = "Read operation aborted";
                break;

            case e.target.error.SECURITY_ERR:
                error_str = "File is locked";
                break;

            case e.target.error.ENCODING_ERR:
                error_str = "File too large";

                break;

            default:
                error_str = "Error reading file";
        }
        send_error(error_str);
    }

    reader.onprogress = function (e) {
        postMessage({ msg_type: MSG_LOAD_IN_PROGRESS, id: model_id, loaded: e.loaded, total: e.total });
    };

    reader.onload = function (e) {
        after_file_load(e.target.result);
    };

    reader.readAsArrayBuffer(f);
}

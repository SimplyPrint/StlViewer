# StlViewer

## This version has been modified to support a more integrated approach using the viewstl library.

Javascript STL/OBJ 3D files Viewer

Reads binary/ASCII STL files; OBJ files

Usage:
================
At the html page header / page body:
```
<script src="StlViewer.js"></script>
```

At the page body, create an element to contain the Stl Viewer, and give it an ID:
```
<div id="stl_cont"></div>
```

Create a new instance of Stl Viewer (simplest initiation - read and view STL file called 'mystl.stl'):
```
var stl_viewer=new StlViewer(document.getElementById("stl_cont"), { models: [ {id:0, filename:"mystl.stl"} ] });
```

## Dependency on JSZip library:

This functionality has been removed from this version of the library.

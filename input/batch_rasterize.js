"use strict";
var fs = require('fs'),
    system = require('system'),
    webpage = require('webpage');

var inputDir, outputFormat, size, pageWidth, pageHeight, zoomFactor;

function showUsage() {
    console.log('Usage: batch_rasterize.js input_directory output_format [size] [zoom]');
    console.log('  input_directory: Directory containing SVG or HTML files');
    console.log('  output_format: "png" or "pdf"');
    console.log('  size (optional): ');
    console.log('    For PDF: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    console.log('    For PNG: "1920px" or "800px*600px"');
    console.log('  zoom (optional): Zoom factor (e.g., 1.0, 2.0)');
    console.log('');
    console.log('Examples:');
    console.log('  batch_rasterize.js ./svg_files png 1920px 1.0');
    console.log('  batch_rasterize.js ./html_files pdf A4');
}

if (system.args.length < 3 || system.args.length > 5) {
    showUsage();
    phantom.exit(1);
}

inputDir = system.args[1];
outputFormat = system.args[2].toLowerCase();

if (outputFormat !== 'png' && outputFormat !== 'pdf') {
    console.log('Error: Output format must be "png" or "pdf"');
    showUsage();
    phantom.exit(1);
}

// Check if directory exists
if (!fs.exists(inputDir) || !fs.isDirectory(inputDir)) {
    console.log('Error: Directory "' + inputDir + '" does not exist or is not a directory');
    phantom.exit(1);
}

// Parse size parameter
if (system.args.length > 3) {
    size = system.args[3];
    if (outputFormat === 'png' && size.substr(-2) === "px") {
        var sizeArray = size.split('*');
        if (sizeArray.length === 2) {
            pageWidth = parseInt(sizeArray[0], 10);
            pageHeight = parseInt(sizeArray[1], 10);
        } else {
            pageWidth = parseInt(size, 10);
            pageHeight = parseInt(pageWidth * 3/4, 10);
        }
    }
}

// Parse zoom factor
if (system.args.length > 4) {
    zoomFactor = parseFloat(system.args[4]);
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function getBaseName(filename) {
    return filename.substring(0, filename.lastIndexOf('.'));
}

function isValidFile(filename) {
    var ext = getFileExtension(filename);
    return ext === 'svg' || ext === 'html' || ext === 'htm';
}

function processFile(inputPath, outputPath, callback) {
    var page = webpage.create();
    
    // Set default viewport
    page.viewportSize = { width: 1024, height: 768 };
    
    // Configure page based on output format and size
    if (outputFormat === 'pdf') {
        if (size) {
            var sizeArray = size.split('*');
            page.paperSize = sizeArray.length === 2 
                ? { width: sizeArray[0], height: sizeArray[1], margin: '0px' }
                : { format: size, orientation: 'portrait', margin: '1cm' };
        } else {
            page.paperSize = { format: 'A4', orientation: 'portrait', margin: '1cm' };
        }
    } else if (outputFormat === 'png' && pageWidth && pageHeight) {
        page.viewportSize = { width: pageWidth, height: pageHeight };
        if (size && size.split('*').length === 2) {
            page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };
        }
    }
    
    // Set zoom factor
    if (zoomFactor) {
        page.zoomFactor = zoomFactor;
    }
    
    console.log('Processing: ' + inputPath + ' -> ' + outputPath);
    
    page.open(inputPath, function (status) {
        if (status !== 'success') {
            console.log('Error: Unable to load ' + inputPath);
            page.close();
            callback();
        } else {
            setTimeout(function () {
                try {
                    page.render(outputPath);
                    console.log('Success: ' + outputPath + ' created');
                } catch (e) {
                    console.log('Error rendering ' + outputPath + ': ' + e);
                }
                page.close();
                callback();
            }, 500); // Wait a bit longer for complex content to load
        }
    });
}

function processFiles() {
    var files = fs.list(inputDir);
    var validFiles = [];
    
    // Filter valid files
    files.forEach(function(file) {
        if (file !== '.' && file !== '..' && isValidFile(file)) {
            validFiles.push(file);
        }
    });
    
    if (validFiles.length === 0) {
        console.log('No SVG or HTML files found in directory: ' + inputDir);
        phantom.exit(0);
    }
    
    console.log('Found ' + validFiles.length + ' file(s) to process');
    
    var index = 0;
    
    function processNext() {
        if (index >= validFiles.length) {
            console.log('All files processed successfully!');
            phantom.exit(0);
            return;
        }
        
        var filename = validFiles[index];
        var inputPath = inputDir + '/' + filename;
        var baseName = getBaseName(filename);
        var outputPath = inputDir + '/' + baseName + '.' + outputFormat;
        
        index++;
        processFile(inputPath, outputPath, processNext);
    }
    
    processNext();
}

// Start processing
processFiles();
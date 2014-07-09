(function(api)
{

// The 'z' position of the light source
api.lightHeight = 0.5;

// The ambient light color
api.ambientLight = [0.1, 0.1, 0.1];

// The minimum light intensity to show
api.minLightIntensity = 0.0;

// The light source color
api.lightDiffuse = [1, 1, 1];

// Bake the lighting for a given diffuse and normal map
// Returns an array of canvases
api.bake = function(numDirs, diffuseMap, normalMap)
{
  var canvasDiffuse = createCanvas(diffuseMap.width, diffuseMap.height);
  var canvasNormals = createCanvas(normalMap.width, normalMap.height);

  var contextDiffuse = canvasDiffuse.getContext('2d');
  var contextNormals = canvasNormals.getContext('2d');

  contextDiffuse.drawImage(diffuseMap, 0, 0);
  contextNormals.drawImage(normalMap, 0, 0);

  var bufferDiffuse = contextDiffuse.getImageData(0, 0, diffuseMap.width, diffuseMap.height);
  var bufferNormals = contextNormals.getImageData(0, 0, normalMap.width, normalMap.height);

  var bakedImages = [];
  var normals = [];

  // Calculate normals of normal map
  for (var x = 0; x < bufferNormals.width; ++x)
  {
    normals[x] = [];
    for (var y = 0; y < bufferNormals.height; ++y)
    {
      normals[x][y] = [];
      var normal = normals[x][y];
      var index = (x + y * bufferNormals.width) * 4;

      // Extract normal and transform 0-255 to -1 - 1
      normal[0] = ((bufferNormals.data[index + 0] / 255) - 0.5) * 2;
      normal[1] = ((bufferNormals.data[index + 1] / 255) - 0.5) * 2;
      normal[2] = ((bufferNormals.data[index + 2] / 255) - 0.5) * 2;

      // Normalize the vector
      var len = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
      normal[0] /= len;
      normal[1] /= len;
      normal[2] /= len;
    }
  }

  function bakeDirection(dir)
  {
    // Build buffer for light map
    var canvas = createCanvas(diffuseMap.width, diffuseMap.height); 
    var context = canvas.getContext('2d');
    var buffer = context.getImageData(0, 0, canvas.width, canvas.height);

    // Build light vector
    var lightDir = [Math.cos(dir), Math.sin(dir), api.lightHeight];

    // For every pixel
    for (var x = 0; x < bufferNormals.width; ++x)
    {
      for (var y = 0; y < bufferNormals.height; ++y)
      {
        // Get normal and diffuse color
        // Diffuse rgb is normalized to 0-1 for calculations
        var normal = normals[x][y];
        var index = (x + y * bufferNormals.width) * 4;
        var diffuse = 
        [
          bufferDiffuse.data[index + 0], 
          bufferDiffuse.data[index + 1], 
          bufferDiffuse.data[index + 2], 
          bufferDiffuse.data[index + 3]
        ];
        diffuse[0] /= 255;
        diffuse[1] /= 255;
        diffuse[2] /= 255;

        // Calculate n dot l lighting component
        var intensity = normal[0] * lightDir[0] + normal[1] * lightDir[1] + normal[2] * lightDir[2];
        intensity = Math.min(1, intensity);
        intensity = Math.max(api.minLightIntensity, intensity);

        // Build output pixel
        var out = 
        [
          intensity * diffuse[0] * api.lightDiffuse[0] + api.ambientLight[0], 
          intensity * diffuse[1] * api.lightDiffuse[1] + api.ambientLight[1], 
          intensity * diffuse[2] * api.lightDiffuse[2] + api.ambientLight[2], 
          diffuse[3]
        ];

        // Rescale rgb to 0-255 range
        out[0] = Math.floor(out[0] * 255);
        out[1] = Math.floor(out[1] * 255);
        out[2] = Math.floor(out[2] * 255);

        // Set the pixel
        buffer.data[index + 0] = out[0];
        buffer.data[index + 1] = out[1];
        buffer.data[index + 2] = out[2];
        buffer.data[index + 3] = out[3];
      }
    }

    // Apply the changes and return the canvas
    context.putImageData(buffer, 0, 0);
    return canvas;
  }

  // Run the bake routine for every angle division
  for (var i = 0; i < numDirs; ++i)
  {
    var lightDir = (Math.PI * 2 / numDirs) * i;
    bakedImages.push(bakeDirection(lightDir));
  }

  return bakedImages;
}

function createCanvas(width, height)
{
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

})(this.Lightr = this.Lightr || {});
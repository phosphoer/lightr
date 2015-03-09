Lightr
======

[![lightr API Documentation](https://www.omniref.com/js/npm/lightr.png)](https://www.omniref.com/js/npm/lightr)

Bake lighting in HTML5 Canvas using normal maps.

Take this:

![diffuse](http://i.imgur.com/nqqxWv5.png)

And this:

![normal](http://i.imgur.com/kustYeu.png)

And make this:

![gif](http://i.imgur.com/d4gpMbN.gif)


## Usage

Download Lightr.js, the API is pretty simple.

You can also install via npm.

`npm install lightr`

### Lightr.lightHeight
Default `0.5`

This controls the Z position of the light source. Currently Lightr only supports a single directional light for baking. Positive values mean the light will be above your sprite, so flat surfaces will get lit.

### Lightr.ambientLight
Default `[0.1, 0.1, 0.1]`

This controls the color / intensity of the ambient light. This value is directly added to the final color, so [1, 1, 1] means your output will be fully white!

### Lightr.minLightIntensity
`Default 0.0`

This controls the minimum light that any one pixel can receive. A value of 0 means that if the surface is facing away from the light source, it will be completely dark. A value of 1 means that all pixels are always fully lit.

### Lightr.lightDiffuse
Default `[1, 1, 1]`

This controls the color of the light source. The default is a plain white light.

### Array\<Canvas\> Lightr.bake(int numDirs, Image diffuseMap, Image normalMap)
This is the function you use to actually bake your lighting out to a set of images. The last two parameters are `Image` objects, that represent your diffuse (color) map, and the relevant normal map. `numDirs` is how many divisions of a full circle the lighting should calculate. For example, a value of 4 would give you 4 images back, one for each cardinal direction. A value of 8 gives you 8 images, and so on. I find that 6-8 images is sufficient for most purposes.

The return is an array of `Canvas` elements containing the rendered out lighting, in counter clockwise order. I utilize these by blending between them at runtime based on the direction of the light to my sprite. 

## Example

```javascript
Lightr.minLightIntensity = 0.2;

var diffuse = new Image();
var normal = new Image();
diffuse.src = 'diffuse.png';
normal.src = 'normal.png';

diffuse.onload = function()
{
  normal.onload = function()
  {
    var buffers = Lightr.bake(6, diffuse, normal);
  };
};
```

## License

MIT

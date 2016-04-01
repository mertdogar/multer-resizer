# Multer Resizer

Multer Resizer is an addon for the commonly used express library multer. It extends the file upload feature of multer and transforms resizing-uploaded-images to a piece of cake.

Traditional image upload using multer:
```
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})
```

With Multer Resizer, you get the original file and also additional resized versions of it:
```
app.post('/profile', resizer.single(upload, 'avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.file.coverPath, req.file.thumbnailPath etc...
})
```

### Configurations
Configuring multer resizer is easy, just declare tasks in an array. Any number of tasks are accepted.
```
const MulterResizer = require('multer-resizer');
const resizer = new MulterResizer({
    tasks: [
        {...},
        {...}
    ]
});
```
#### Tasks
##### Resize
Resizes an image. The image is resized to the given dimension and the aspect ratio of the resized version may not be the same with the original image.

###### Usage

```
{
    resize: {
        width: 1920,
        height: 1080,
        interpolation: 'linear',
        format: 'png'
    }
}
```

Option | Description
---: | ---
*interpolation* | 'nearest-neighbor', 'moving-average', 'linear', 'grid', 'cubic', 'lanczos' `default: 'linear'`
*format* | 'png', 'jpg', 'gif' `default: 'png'`
*suffix* | `default: 'resized'`
*width* | Width in pixels
*height* | Height in pixels

##### Cover
Cover a canvas with the image. The image will be resized to the smallest possible size such that both its dimensions are bigger than the canvas's dimensions. Margins of the image exceeding the canvas will be discarded.
###### Usage

```
{
    cover: {
        width: 800,
        height: 600,
        interpolation: 'linear',
        format: 'png'
    }
}
```

Option | Description
---: | ---
*interpolation* | 'nearest-neighbor', 'moving-average', 'linear', 'grid', 'cubic', 'lanczos' `default: 'linear'`
*format* | 'png', 'jpg', 'gif' `default: 'png'`
*suffix* | `default: 'cover'`
*width* | Width in pixels
*height* | Height in pixels

### Example
```
const multer = require('multer');
const uploader = multer({
    storage: multer.diskStorage({destination: './'})
});
const MulterResizer = require('multer-resizer');
const resizer = new MulterResizer({
    tasks: [
        {
            resize: {
                width: 1920,
                height: 1080,
                suffix: 'resized-big'
            }
        },
        {
            resize: {
                width: 100,
                height: 100,
                suffix: 'resized-small'
            }
        },
        {
            cover: {
                width: 160,
                height: 112,
                suffix: 'thumbnail'
            }
        }
    ]
});

router.post('/', auth.ensureAuthentication, resizer.single(uploader, 'file'), function(req, res, next) {
    // All multer-resizer tasks were completed
});

```

### Dependencies
Nodejs 4+

The MIT License
===============

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

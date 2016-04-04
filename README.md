# Multer Resizer

Multer Resizer is an addon for the commonly used express library multer. It extends the file upload feature of multer and transforms image-resizing to a piece of cake.

Traditional image upload using multer:
```javascript
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})
```

With Multer Resizer, you get the original file and also additional resized versions of it:
```javascript
app.post('/profile', resizer.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.file.coverPath, req.file.resizedPath etc...
})
```

### Installation
I am not going to publish my projects to npm anymore. You can install multer-resizer through this github repository using the command below:

```sh
$ npm install mertdogar/multer-resizer

```


### Configurations
Configuring multer resizer is easy, just declare tasks in an array. Any number of tasks are accepted.
```javascript
const MulterResizer = require('multer-resizer');
const resizer = new MulterResizer({
    multer: uploader,
    tasks: [
        {...},
        {...}
    ]
});
```
#### Multer Instance
Multer resizer is not a multipart file handler, it just extends an existing multer instance. Therefore, you must provide a properly configured multer instance to make it work.
```javascript
    multer: uploader
```
#### Tasks
##### Resize
Resizes an image. The image is resized to the given dimension and the aspect ratio of the resized version may not be the same with the original image.

###### Usage

```javascript
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

```javascript
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
```javascript
const multer = require('multer');
const MulterResizer = require('multer-resizer');
const resizer = new MulterResizer({
    multer: multer({storage: multer.diskStorage({destination: './'})}),
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

router.post('/', auth.ensureAuthentication, resizer.single('file'), function(req, res, next) {
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

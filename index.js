'use strict';

const _ = require('lodash');
const lwip = require('lwip-promise');
const async = require('async-q');


class Resizer {
    constructor(options) {
        this.options = _.assign({}, Resizer.defaultOptions, options || {});
    }


    getPathWithoutExtension(filePath) {
        return filePath.substr(0, filePath.lastIndexOf('.'));
    }


    getExtension(filePath) {
        return filePath.substr(filePath.lastIndexOf('.') + 1);
    }


    createCover(filePath, options) {
        const suffix = options.suffix || 'cover';
        const interpolation = options.interpolation || 'linear';
        const format = options.format || 'png';
        const dstPath = this.getPathWithoutExtension(filePath) + `_${suffix}.png`;

        return lwip
            .openAsync(filePath)
            .then(image => image.coverAsync(options.width, options.height, interpolation))
            .then(resizedImage => resizedImage.writeFileAsync(dstPath, format))
            .then(() => dstPath);
    }


    createResized(filePath, options) {
        const suffix = options.suffix || 'resized';
        const interpolation = options.interpolation || 'linear';
        const format = options.format || 'png';
        const dstPath = this.getPathWithoutExtension(filePath) + `_${suffix}.png`;

        return lwip
            .openAsync(filePath)
            .then(image => {
                const width = image.width();
                const height = image.height();
                const aspectRatio = width / height;

                let resizeWidth = width;
                let resizeHeight = height;

                if (resizeWidth > options.width) {
                    resizeWidth = options.width;
                    resizeHeight = resizeWidth / aspectRatio;
                } else if (resizeHeight > options.height) {
                    resizeHeight = options.height;
                    resizeWidth = resizeHeight * aspectRatio;
                }

                return image.resizeAsync(resizeWidth, resizeHeight, interpolation);
            })
            .then(resizedImage => resizedImage.writeFileAsync(dstPath, format))
            .then(() => dstPath);
    };


    processImage(filePath, attachBase) {
        const jobs = _.map(this.options.tasks, task => {
            if (_.isObject(task.resize)) {
                return _ => this.createResized(filePath, task.resize).then(path => attachBase.resizedPath = path);
            } else if (_.isObject(task.cover)) {
                return _ => this.createCover(filePath, task.cover).then(path => attachBase.coverPath = path);
            }
        });

        return async.series(jobs);
    }


    single(filename) {
        return (req, res, next) => {
            if (!this.options.multer)
                return next(new Error('multer is undefined, please provide one at configuration.'));
            this.options.multer.single(filename)(req, res, err => {
                if (!_.isObject(req.file))
                    return next(new Error('Uploaded file not found.'));

                this
                    .processImage(req.file.path, req.file)
                    .then(_ => next())
                    .catch(next);
            });
        };
    }


    array(filename, maxCount) {
        return (req, res, next) => {
            if (!this.options.multer)
                return next(new Error('multer is undefined, please provide one at configuration.'));

            this.options.multer.array(filename, maxCount)(req, res, err => {
                if (!_.isObject(req.files))
                    return next(new Error('Uploaded files not found.'));

                async
                    .eachSeries(req.files,
                        file => this.processImage(file.path, file))
                    .then(_ => next())
                    .catch(next);
            });
        };
    }
}


Resizer.defaultOptions = {
    tasks: [],
    multer: null
};


module.exports = Resizer;

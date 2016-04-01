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


    createThumbnail(filePath, options) {
        const suffix = options.suffix || 'thumbnail';
        const interpolation = options.interpolation || 'linear';
        const format = options.format || 'png';
        const dstPath = this.getPathWithoutExtension(filePath) + `_${suffix}.png`;

        return lwip
            .openAsync(filePath)
            .then(image => image.coverAsync(options.width, options.height, interpolation))
            .then(resizedImage => resizedImage.writeFileAsync(dstPath, format))
            .then(() => dstPath);
    }


    createCover(filePath, options) {
        const suffix = options.suffix || 'cover';
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
            if (_.isObject(task.cover)) {
                return _ => this.createCover(filePath, task.cover).then(path => attachBase.coverPath = path);
            } else if (_.isObject(task.thumbnail)) {
                return _ => this.createThumbnail(filePath, task.thumbnail).then(path => attachBase.thumbnailPath = path);
            }
        });

        return async.series(jobs)
    }


    single(multerInstance, filename) {
        const that = this;
        return function(req, res, next) {
            multerInstance.single(filename)(req, res, err => {
                that
                    .processImage(req.file.path, req.file)
                    .then(_ => next())
                    .catch(next);
            });
        };
    }


    array(multerInstance, filename, maxCount) {
        const that = this;
        return function(req, res, next) {
            multerInstance.array(filename, maxCount)(req, res, err => {
                async
                    .eachSeries(req.files,
                        file => that.processImage(file.path, file))
                    .then(_ => next())
                    .catch(next);
            });
        };
    }
}


Resizer.defaultOptions = {
    tasks: []
};


module.exports = Resizer;

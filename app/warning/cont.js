'use strict';

const Promise = require('bluebird');
const result = require('../../util/res');
const validator = require('./validator');

const warningDal = require('./dal');
const articleDataDal = require('../article-data/dal');
const userDal = require('../user/dal');

exports.create = (req, res) => {
    let articleData, message, poster;

    validator.hasRequiredFields(req)
        .then(data => {
            articleData = data.data;
            message = data.message;
            poster = data.poster;
            return articleDataDal.findOne({_id: articleData});
        })
        .then(found => {
            if (!found) {
                return Promise.reject(result.rejectStatus(`ArticleData with _id ${articleData} does not exist`, 404));
            } else {
                return userDal.findOne({_id: poster});
            }
        })
        .then(found => {
            if (!found) {
                return Promise.reject(result.rejectStatus(`User with _id ${poster} does not exist`, 404));
            } else {
                return warningDal.create(articleData, message, poster);
            }
        })
        .then(warning => {
            result.dataStatus(warning, 201, res);
        })
        .catch(reject => {
            result.errorReject(reject, res);
        });
};

exports.findAll = (req, res) => {
    warningDal.findAll()
        .then(warnings => result.data(warnings, res))
        .catch(reject => result.errorReject(reject, res));
};

exports.validateOne = (req, res, next, warningId) => {
    warningDal.findOne({_id: warningId})
        .then(warning => {
            if (warning) {
                req.warning = warning;
                next();
            } else {
                result.errorStatus(`Warning with _id ${warningId} does not exist`, 404, res);
            }
        });
};

exports.findOne = (req, res) => result.data(req.warning, res);
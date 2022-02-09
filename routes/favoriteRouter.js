const express = require('express');
var mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

var FavoriteItems = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    FavoriteItems.findOne({ user: req.user._id})
    .populate('user')
    .populate('favoriteItems')
    .then((favoriteItems) => {
        if (favoriteItems) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favoriteItems);
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json([]);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoriteItems.findOne({ user: req.user._id }, (err, favoriteItems) => {
        if (err) return next(err);

        if (!favoriteItems) {
            FavoriteItems.create({ user: req.user._id })
            .then((favoriteItems) => {
                for(i = 0; i < req.body.length; i++) 
                   if (favoriteItems.favoriteItems.indexOf(req.body[i]._id) < 0)
                      favoriteItems.favoriteItems.push(req.body[i]);
                favoriteItems.save()
                .then((favoriteItems) => {
                    console.log('favoriteItems created!');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favoriteItems);
                })
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);
            })
        }
        else {
            for (i = 0; i < req.body.length; i++)
                if (favoriteItems.favoriteItems.indexOf(req.body[i]._id) < 0)
                   favoriteItems.favoriteItems.push(req.body[i]);
            favoriteItems.save()
            .then((favoriteItems) => {
                console.log('favorite item added!');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favoriteItems);
            })
            .catch((err) => {
                return next(err);
            });
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoriteItems.findOneAndRemove({ user: req.user._id }, (err, resp) => {
        if (err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    });
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text-plain');
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoriteItems.findOne({ user: req.user._id }, (err, favoriteItems) => {
        if (err) return next(err);

        if(!favoriteItems) {
            FavoriteItems.create({ user: req.user._id })
            .then((favoriteItems) => {
                favoriteItems.favoriteItems.push({ "_id": req.params.dishId });
                favoriteItems.save()
                .then((favoriteItems) => {
                    console.log('Favorite Items created!');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favoriteItems);
                })
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);
            })
        }
        else {
            if (favoriteItems.favoriteItems.indexOf(req.params.dishId) < 0) {
                favoriteItems.favoriteItems.push({ "_id": req.params.dishId });
                favoriteItems.save()
                .then((favoriteItems) => {
                    console.log('favorite item added!');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favoriteItems);
                })
                .catch((err) => {
                    return next(err);
                })
            }
            else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Favorite Item ' + req.params.dishId + ' already in the list of favorite items!');
            }
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoriteItems.findOne({ user: req.user._id }, (err, favoriteItems) => {
        if (err) return next(err);

        console.log(favoriteItems);
        var index = favoriteItems.favoriteItems.indexOf(req.params.dishId);
        if (index >= 0) {
            favoriteItems.favoriteItems.splice(index,1);
            favoriteItems.save()
            .then((favoriteItems) => {
                console.log('favorite item deleted!', favoriteItems);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favoriteItems);
            })
            .catch((err) => {
                return next(err);
            })
        }
        else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Favorite Item ' + req,params.dishId + ' is not present in your favorite items!');
        }
    });
});

module.exports = favoriteRouter;
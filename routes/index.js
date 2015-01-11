var express = require('express');
var router = express.Router();
var fs = require('fs');
var mkdirp = require('mkdirp');
var utils = require('../utils/utils');


// GET home page.
exports.index = function(req, res, next) {
	res.render('index', { title: 'Express' });	
};

// GET uploaded image.
exports.image = function(req, res, next) {
	path = './media/' + req.params['path'];
	fs.exists(path, function(exists) {
		if (exists)
			res.sendfile(path);
		else
			res.redirect('/images/404.jpg');
	});
};

// GET metadata info.
exports.metadata = function(req, res, next) {
	var db = req.db;
	var movie = req.params.movie;
	if(movie) {
		// 回傳 metadata 列表
		db.collection('metadata').find({'movie':movie}).toArray(function (err, items) {
			res.json(items);
		});
	} else {
		// 回傳 metadata 數量
		db.collection('metadata').find().count(function(err, count) {
			res.send(
				(err === null) ? { 'count': count } : { error: err }
			);
		});
	}
};

// POST metadata.
exports.upload_metadata = function(req, res, next) {
	var db = req.db;
	db.collection('metadata').update(req.body, req.body, { upsert : true }, function(err, result) {
		res.send(
			(err === null) ? { error: undefined } : { error: err }
		);
	});
};

// POST snapshot.
exports.upload_snapshot = function(req, res, next) {
	var file =req.files.snapshot;
	if(file != null) {
		if('image/jpeg' != file.mimetype)
			fs.unlink(file.path);
	}
	res.send({ error : undefined });
};

// POST search snapshots.
exports.search = function(req, res, next) {
	var db = req.db;
	var hash = req.param('hash');

	if(hash != null)  {
		// Search DB
		db.collection('metadata').find({}, function(err, cursor) {
			cursor.toArray(function(err, documents) {
				var snapshotList = [];
				
				// Calculate hamming distance
				for(i=0; i < documents.length; i++) {
					dis = utils.hamdist(hash, documents[i].hash);
					if(dis < 6 && dis >= 0) {
						documents[i].distance = dis;
						snapshotList.push(documents[i]);
					}
				}

				// Response matched list
				res.json(snapshotList.slice(0, snapshotList.length >= 10 ? 10 : snapshotList.length));	
			});
		});
	} else {
		res.status(404).end();
	}
};
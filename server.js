var express = require('express');
var svair = require('./');

var app = express();

app.get('/', function (req, res, next) {
    if (!req.query.numeroFiscal || !req.query.referenceAvis) {
        return res.status(400).send({
            code: 400,
            message: 'Requête incorrecte',
            explaination: 'Les paramètres numeroFiscal et referenceAvis doivent être fournis dans la requête.'
        });
    } else {
        svair(req.query.numeroFiscal, req.query.referenceAvis, function (err, result) {
            if (err && err.message === 'Invalid credentials') {
                res.status(404).send({
                    code: 404,
                    message: 'Résultat non trouvé',
                    explaination: 'Les paramètres fournis sont incorrects ou ne correspondent pas à un avis'
                });
            } else if (err) {
                next(err);
            } else {
                res.send(result);
            }
        });
    }
});

app.listen(process.env.PORT);

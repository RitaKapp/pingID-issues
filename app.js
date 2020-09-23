const expressSesssion = require('express-session');
const passport = require('passport');
const { Issuer, Strategy } = require('openid-client');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');

const port = 3000;

const {
    discover_url,
    client_id,
    client_secret,
// } = require('./google.cfg.json');
} = require(`./${process.env.AUTH}.cfg.json`);

const indexRouter = express.Router();
indexRouter.get('/', function (req, res, next) {
    res.send('index route' + '<hr>' + '<a href="./auth">login</a>' + '<hr>' + JSON.stringify(req.user, null, 4));
});

const usersRouter = express.Router();
usersRouter.get('/', function (req, res, next) {
    res.send('usersRouter route' + '<hr>' + '<a href="./auth">login</a>' + '<hr>' + JSON.stringify(req.user, null, 4));
});

Issuer.discover(discover_url)
    .then(criiptoIssuer => {
        const client = new criiptoIssuer.Client({
            client_id,
            client_secret,
            redirect_uris: ['http://localhost:3000/auth/callback'],
            post_logout_redirect_uris: ['http://localhost:3000/logout/callback'],
            token_endpoint_auth_method: 'client_secret_post',
            response_types: ['code']
        });

        const app = express();

        app.set('port', port);

        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));

        app.use(
            expressSesssion({
                secret: 'keyboard cat',
                resave: false,
                saveUninitialized: true,
                cookie: {
                    secure: false
                }
            })
        );

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(
            'oidc',
            new Strategy({ client }, (tokenSet, userinfo, done) => {
                return done(null, tokenSet.claims());
            })
        );

        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, user);
        });


        app.get('/auth', (req, res, next) => {
            passport.authenticate('oidc', { acr_values: '' })(req, res, next);
        });

        // authentication callback
        app.get('/auth/callback', (req, res, next) => {
            passport.authenticate('oidc', {
                successRedirect: '/users',
                failureRedirect: '/'
            })(req, res, next);
        });

        app.use('/', indexRouter);
        app.use('/users', usersRouter);

        // start logout request
        app.get('/logout', (req, res) => {
            res.redirect(client.endSessionUrl());
        });

        // logout callback
        app.get('/logout/callback', (req, res) => {
            // clears the persisted user from the local storage
            req.logout();
            // redirects the user to a public route
            res.redirect('/');
        });

        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            res.end('404');
        });

        // error handler
        app.use(function (err, req, res, next) {
            console.error(err);

            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.end('error');
        });

        const server = http.createServer(app);
        server.listen(port);
    });




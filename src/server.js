'use strict'

/**
 * Module dependencies.
 */
import path from 'path';
import {Server} from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import PageNotFound from './components/PageNotFound';

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));
app.use(Express.static(path.join(__dirname, 'static')));

// universal routing and rendering
app.get('*', (req, res) => {
  match(
    { routes, location: req.url },
    (err, redirectLocation, renderProps) => {

      // in case of error display the error message
      if (err) {
        return res.status(500).send(err.message);
      }

      // in case of redirect propagate the redirect to the browser
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }

      // generate the React markup for the current route
      let markup;
      if (renderProps) {
        // if the current route matched we have renderProps
        markup = renderToString(<RouterContext {...renderProps}/>);
      } else {
        // otherwise we can render a 404 page
        markup = renderToString(<PageNotFound/>);
        res.status(404);
      }

      // render the index template with the embedded React markup
      return res.render('index', { markup });
    }
  );
});

/**
  * Get port from environment and the environment stage.
 */
const port = process.env.PORT || 8080;
const env = process.env.NODE_ENV || 'production';

// start the server
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port} [${env}]`);
});
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { readSchemaFiles } from './lib/utils';
import { RestSchemaAnnotation, GraphQLSchemaAnnotation, MapSchemaAnnotation } from 'annotated-graphql/dist/annotations';
import { graphqlDispatcherFactory, schemasDispatcherFactory } from './index';

const APPLICATION_PORT = process.env.PORT || 3000;
const SCHEMA_FOLDER_PATH = process.env.SCHEMA_FOLDER || 'schemas';
const BASE_ENDPOINT_URL_PATH = '/graphql';
const DASHBOARD_ENDPOINT = '/dashboard';
const annotatedSchemasTextByFilename = readSchemaFiles(SCHEMA_FOLDER_PATH);
const graphqlDispatcher = graphqlDispatcherFactory(
    BASE_ENDPOINT_URL_PATH,
    annotatedSchemasTextByFilename,
    [
        RestSchemaAnnotation,
        GraphQLSchemaAnnotation,
        MapSchemaAnnotation
    ]
);

express()
    .use(bodyParser.json())
    .use(cors())
    .use(`${BASE_ENDPOINT_URL_PATH}(/:api)?`, graphqlDispatcher)
    .use('/schema/:api', schemasDispatcherFactory(annotatedSchemasTextByFilename))
    .use(DASHBOARD_ENDPOINT, express.static(__dirname + '/static/dashboard'))
    .use('*', (req, res) => res.redirect('/graphql'))
    .listen(APPLICATION_PORT, _ => console.log('GraphQL server is now running on port:', APPLICATION_PORT));

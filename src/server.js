import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
    readSchemaFiles
} from './lib/utils';
import {
    RestSchemaAnnotation,
    GraphQLSchemaAnnotation
} from 'annotated-graphql/dist/annotations';
import {
    graphqlEndpointDispatcherFactory,
    schemaDispatcherFactory
} from './index';

const APPLICATION_PORT = process.env.PORT || 3000,
    SCHEMA_FOLDER_PATH = process.env.SCHEMA_FOLDER || 'schemas',
    BASE_ENDPOINT_URL_PATH = '/graphql',
    annotatedSchemas = readSchemaFiles(SCHEMA_FOLDER_PATH),
    graphqlEndpointDispatcher = graphqlEndpointDispatcherFactory(
        BASE_ENDPOINT_URL_PATH,
        annotatedSchemas,
        [
            RestSchemaAnnotation.createExtractor(),
            GraphQLSchemaAnnotation.createExtractor()
        ]
    );

express()
    .use(bodyParser.json())
    .use(cors())
    .use(`${BASE_ENDPOINT_URL_PATH}(/:api)?`, graphqlEndpointDispatcher)
    .use('/schema/:api', schemaDispatcherFactory(annotatedSchemas))
    .use('*', (req, res) => res.redirect('/graphql'))
    .listen(APPLICATION_PORT, _ => console.log('GraphQL server is now running on port:', APPLICATION_PORT));

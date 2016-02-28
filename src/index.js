import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
    RestSchemaAnnotation,
    GraphQLSchemaAnnotation
} from 'annotated-graphql/dist/annotations';
import graphqlEndpointDispatcherFactory from './graphql-endpoint-dispatcher-factory';
import schemaDispatcherFactory from './schema-dispatcher-factory';

const APPLICATION_PORT = process.env.PORT || 3000,
    annotatedSchemas = {
        'transport': readSchemaFile('transport-api.graphql'),
        'github': readSchemaFile('github-api.graphql')
    },
    graphqlEndpointDispatcher = graphqlEndpointDispatcherFactory(
        annotatedSchemas,
        [
            RestSchemaAnnotation.createExtractor(),
            GraphQLSchemaAnnotation.createExtractor()
        ]
    );

express()
    .use(bodyParser.json())
    .use(cors())
    .use('/graphql(/:api)?', graphqlEndpointDispatcher)
    .use('/schema/:api', schemaDispatcherFactory(annotatedSchemas))
    .listen(APPLICATION_PORT, _ => console.log('GraphQL server is now running on port:', APPLICATION_PORT));

function readSchemaFile(schemaFileName) {
    return fs.readFileSync(path.join(__dirname, 'schemas', schemaFileName), 'utf8');
}
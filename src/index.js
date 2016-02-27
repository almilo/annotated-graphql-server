import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { RestSchemaAnnotation } from 'annotated-graphql/dist/annotations';
import graphqlEndpointDispatcherFactory from './graphql-endpoint-dispatcher-factory';

const APPLICATION_PORT = 3000,
    graphqlEndpointDispatcher = graphqlEndpointDispatcherFactory(
        {
            'transport': readSchemaFile('transport-api.graphql'),
            'github': readSchemaFile('github-api.graphql')
        },
        [
            RestSchemaAnnotation.createExtractor()
        ]
    );

express()
    .use(bodyParser.json())
    .use(cors())
    .use('/graphql(/:api)?', graphqlEndpointDispatcher)
    .listen(APPLICATION_PORT, _ => console.log('GraphQL server is now running on port:', APPLICATION_PORT));

function readSchemaFile(schemaFileName) {
    return fs.readFileSync(path.join(__dirname, 'schemas', schemaFileName), 'utf8');
}
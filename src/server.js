import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
    RestSchemaAnnotation,
    GraphQLSchemaAnnotation
} from 'annotated-graphql/dist/annotations';
import {
    graphqlEndpointDispatcherFactory,
    schemaDispatcherFactory
} from './index';

const APPLICATION_PORT = process.env.PORT || 3000,
    SCHEMA_FOLDER_PATH = process.env.SCHEMA_FOLDER || path.join(__dirname, 'schemas'),
    BASE_ENDPOINT_URL_PATH = '/graphql',
    annotatedSchemas = readSchemaFiles(SCHEMA_FOLDER_PATH),
    schemaDispatcher = schemaDispatcherFactory(annotatedSchemas),
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
    .use('/schema/:api', schemaDispatcher)
    .use('*', (req, res) => res.redirect('/graphql'))
    .listen(APPLICATION_PORT, _ => console.log('GraphQL server is now running on port:', APPLICATION_PORT));

function readSchemaFiles(schemaFolderPath) {
    return fs.readdirSync(schemaFolderPath)
        .reduce(addSchemaFile, {});

    function addSchemaFile(schemas, schemaFileName) {
        const fileId = (schemaFileName.match(/(.*)\.graphql/) || [])[1];

        if (fileId) {
            schemas[fileId] = fs.readFileSync(path.join(schemaFolderPath, schemaFileName), 'utf8');
        }

        return schemas;
    }
}

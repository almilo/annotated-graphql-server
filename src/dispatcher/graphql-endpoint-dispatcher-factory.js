import graphqlHttp from 'express-graphql';
import { AnnotatedGraphQLSchemaFactory } from 'annotated-graphql';
import schemaFactory from './schema-factory';

export default function (baseEndpointUrlPath, annotatedSchemas, schemaAnnotationExtractors) {
    const schemasSchema = schemaFactory(annotatedSchemas, baseEndpointUrlPath),
        schemasEndpoint = graphqlHttp(createEndpointOptionsProvider(schemasSchema)),
        annotatedGraphQLSchemaFactory = new AnnotatedGraphQLSchemaFactory(schemaAnnotationExtractors),
        apiEndpoints = Object.keys(annotatedSchemas).reduce(toApiEndpoint, {});

    return function (req, res) {
        const api = req.params.api, graphqlEndpoint = !api ? schemasEndpoint : apiEndpoints[api];

        if (!graphqlEndpoint) {
            res.status(404).send(`No schema for api: '${api}' found.`)
        } else {
            return graphqlEndpoint.apply(undefined, arguments);
        }
    };

    function toApiEndpoint(apiEndpoints, apiKey) {
        const apiSchema = annotatedGraphQLSchemaFactory.createSchema(annotatedSchemas[apiKey]);
        
        apiEndpoints[apiKey] = graphqlHttp(createEndpointOptionsProvider(apiSchema));

        return apiEndpoints
    }
}

function createEndpointOptionsProvider(schema) {
    return req => ({
        schema,
        pretty: true,
        graphiql: true,
        context: {}
    });
}

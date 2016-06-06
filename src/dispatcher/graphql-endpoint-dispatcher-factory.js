import graphqlHttp from 'express-graphql';
import { AnnotatedGraphQLSchemaFactory } from 'annotated-graphql';
import schemaFactory from './schema-factory';

export default function (baseEndpointUrlPath, annotatedSchemas, schemaAnnotationExtractors) {
    const schemasSchema = schemaFactory(annotatedSchemas, baseEndpointUrlPath),
        schemasEndpoint = graphqlHttp(createEndpointOptions(schemasSchema)),
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
        
        apiEndpoints[apiKey] = graphqlHttp(createEndpointOptions(apiSchema));

        return apiEndpoints
    }
}

function createEndpointOptions(schema) {
    return {
        schema,
        pretty: true,
        graphiql: true
    };
}

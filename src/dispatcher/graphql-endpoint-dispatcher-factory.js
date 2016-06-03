import graphqlHttp from 'express-graphql';
import { AnnotatedGraphQLSchemaFactory } from 'annotated-graphql';
import schemaFactory from './schema-factory';

export default function (baseEndpointUrlPath, annotatedSchemas, schemaAnnotationExtractors) {
    const apisGraphQLEndpoint = graphqlHttp({
            schema: schemaFactory(annotatedSchemas, baseEndpointUrlPath),
            pretty: true,
            graphiql: true
        }),
        annotatedGraphQLSchemaFactory = new AnnotatedGraphQLSchemaFactory(schemaAnnotationExtractors),
        apiEndpoints = Object.keys(annotatedSchemas).reduce(toApiEndpoint, {});

    return function (req, res) {
        const api = req.params.api, graphqlEndpoint = !api ? apisGraphQLEndpoint : apiEndpoints[api];

        if (!graphqlEndpoint) {
            res.status(404).send(`No schema for api: '${api}' found.`)
        } else {
            return graphqlEndpoint.apply(undefined, arguments);
        }
    };

    function toApiEndpoint(apiEndpoints, apiKey) {
        apiEndpoints[apiKey] = graphqlHttp({
            schema: annotatedGraphQLSchemaFactory.createSchema(annotatedSchemas[apiKey]),
            pretty: true,
            graphiql: true
        });

        return apiEndpoints
    }
}

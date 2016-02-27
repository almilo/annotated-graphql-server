import graphqlHttp from 'express-graphql';
import { AnnotatedGraphQLSchemaFactory } from 'annotated-graphql';
import schemaFactory from './schemas/schema-factory';


export default function (annotatedSchemas, schemaAnnotationExtractors) {
    const apisGraphQLEndpoint = graphqlHttp({schema: schemaFactory(annotatedSchemas), pretty: true, graphiql: true}),
        annotatedGraphQLSchemaFactory = new AnnotatedGraphQLSchemaFactory(schemaAnnotationExtractors),
        apiEndpoints = Object.keys(annotatedSchemas).reduce(toApiEndpoint, {});

    return function (req) {
        const api = req.params.api, graphqlEndpoint = !api ? apisGraphQLEndpoint : apiEndpoints[api];

        if (!graphqlEndpoint) {
            throw new Error(`No endpoint for api: '${api} found.`)
        }

        return graphqlEndpoint.apply(undefined, arguments);
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

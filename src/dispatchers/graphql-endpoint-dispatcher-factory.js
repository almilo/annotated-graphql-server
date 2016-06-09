import graphqlHttp from 'express-graphql';
import { AnnotatedGraphQLEndpointFactory } from 'annotated-graphql';
import schemasSchemaFactory from './schemas-schema-factory';

export default function (baseEndpointUrlPath, annotatedSchemasTextByApiId, schemaAnnotationExtractors) {
    const schemasSchema = schemasSchemaFactory(annotatedSchemasTextByApiId, baseEndpointUrlPath),
        annotatedGraphQLSchemaFactory = new AnnotatedGraphQLEndpointFactory(schemaAnnotationExtractors);

    return createEndpointDispatcher(
        graphqlHttp({
            schema: schemasSchema,
            pretty: true,
            graphiql: true
        }),
        Object.keys(annotatedSchemasTextByApiId)
            .reduce(toApiEndpoint, {})
    );

    function toApiEndpoint(apiEndpoints, apiId) {
        apiEndpoints[apiId] = annotatedGraphQLSchemaFactory.createEndpoint(annotatedSchemasTextByApiId[apiId]);

        return apiEndpoints;
    }

    function createEndpointDispatcher(schemasEndpoint, apiEndpoints) {
        return function (req, res) {
            const api = req.params.api, endpoint = !api ? schemasEndpoint : apiEndpoints[api];

            if (!endpoint) {
                res.status(404).send(`No schema for api: '${api}' found.`)
            } else {
                return endpoint.apply(undefined, arguments);
            }
        };
    }
}

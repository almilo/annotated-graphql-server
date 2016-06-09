import { makeExecutableSchema } from 'graphql-tools';

export default function (sourceSchemas, baseEndpointUrlPath) {
    const schemasSchema = `
        type Schema {
            name: String!
            text: String!
            endpoint: String!
        }
        
        type Query {
            schemas: [Schema]
        }
        
        schema {
            query: Query
        }
    `;

    return makeExecutableSchema({
        typeDefs: schemasSchema,
        resolvers: {
            Query: {
                schemas: _ => Object.keys(sourceSchemas).reduce(toSchemaType, [])
            }
        }
    });

    function toSchemaType(schemas, schemaKey) {
        schemas.push({
            name: schemaKey,
            text: sourceSchemas[schemaKey],
            endpoint: `${baseEndpointUrlPath}/${schemaKey}`
        });

        return schemas;
    }
}

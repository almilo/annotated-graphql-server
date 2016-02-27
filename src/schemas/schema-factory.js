import {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList
} from 'graphql';

export default function (sourceSchemas) {
    const SchemaType = new GraphQLObjectType({
            name: 'Schema',
            fields: {
                name: {
                    type: GraphQLString
                },
                text: {
                    type: GraphQLString
                }
            }
        }),
        SchemasQueryType = new GraphQLObjectType({
            name: 'SchemasQuery',
            fields: {
                schemas: {
                    type: new GraphQLList(SchemaType),
                    resolve() {
                        return Object.keys(sourceSchemas).reduce(toSchemaType, []);

                        function toSchemaType(schemas, schemaKey) {
                            schemas.push({
                                name: schemaKey,
                                text: sourceSchemas[schemaKey]
                            });

                            return schemas;
                        }
                    }
                }
            }
        });

    return new GraphQLSchema({
        query: SchemasQueryType
    });
}
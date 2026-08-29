import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi-Tenant Chat Backend API',
      version: '1.0.0',
      description:
        'Production-grade, modular, real-time multi-tenant chat API with JWT authentication, direct/group messaging, and WebSocket integration.',
      contact: {
        name: 'Backend Architecture Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token (obtained via /auth/login or /auth/register)',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'UNAUTHORIZED' },
                message: { type: 'string', example: 'Invalid or expired token' },
                requestId: { type: 'string', example: 'req_123456789' },
              },
            },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'My Web App' },
            status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            applicationId: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Alice Developer' },
            email: { type: 'string', example: 'alice@example.com' },
            avatarUrl: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            applicationId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['DIRECT', 'GROUP'] },
            name: { type: 'string', nullable: true, example: 'Engineering Team' },
            status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            conversationId: { type: 'string', format: 'uuid' },
            senderId: { type: 'string', format: 'uuid' },
            content: { type: 'string', example: 'Hello World!' },
            messageType: { type: 'string', enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'] },
            replyToId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/applications': {
        post: {
          summary: 'Create a new Application (Tenant)',
          tags: ['Applications'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'My E-Commerce App' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Application created successfully with raw API key' },
            400: { description: 'Validation Error' },
          },
        },
      },
      '/applications/{id}': {
        get: {
          summary: 'Get Application Details',
          tags: ['Applications'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Application metadata' },
            404: { description: 'Application not found' },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Register a User in an Application',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['applicationId', 'name', 'email', 'password'],
                  properties: {
                    applicationId: { type: 'string', format: 'uuid' },
                    name: { type: 'string', example: 'Alice' },
                    email: { type: 'string', example: 'alice@example.com' },
                    password: { type: 'string', example: 'SecurePass123!' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully with tokens' },
            409: { description: 'User already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login User',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['applicationId', 'email', 'password'],
                  properties: {
                    applicationId: { type: 'string', format: 'uuid' },
                    email: { type: 'string', example: 'alice@example.com' },
                    password: { type: 'string', example: 'SecurePass123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns JWT access and refresh tokens' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          summary: 'Refresh Access Token',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'New access token issued' },
            401: { description: 'Invalid or expired refresh token' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get Authenticated User Identity',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Current authenticated user context' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/conversations': {
        post: {
          summary: 'Create a Conversation (Direct or Group)',
          tags: ['Conversations'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type'],
                  properties: {
                    type: { type: 'string', enum: ['DIRECT', 'GROUP'] },
                    recipientId: { type: 'string', format: 'uuid', description: 'Required for DIRECT' },
                    name: { type: 'string', description: 'Required for GROUP' },
                    memberIds: {
                      type: 'array',
                      items: { type: 'string', format: 'uuid' },
                      description: 'Required for GROUP',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Conversation created' },
          },
        },
        get: {
          summary: 'List User Conversations',
          tags: ['Conversations'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of active user conversations' },
          },
        },
      },
      '/conversations/{conversationId}/messages': {
        post: {
          summary: 'Send a Message',
          tags: ['Messages'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'conversationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content'],
                  properties: {
                    content: { type: 'string', example: 'Hello world!' },
                    messageType: { type: 'string', enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'], default: 'TEXT' },
                    replyToId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Message sent successfully' },
          },
        },
        get: {
          summary: 'Fetch Message History (Cursor Pagination)',
          tags: ['Messages'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'conversationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'cursor', in: 'query', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Paginated list of messages' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);

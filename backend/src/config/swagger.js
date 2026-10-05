const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FitMirror API',
      version: '1.0.0',
      description:
        'REST API documentation for **FitMirror — Virtual Fitting Room**.\n\n' +
        'A college-level MERN project with JWT authentication, garment catalog, ' +
        'body measurements, rule-based size recommendations, saved looks, ' +
        'Socket.io notifications, and Firebase Auth integration.\n\n' +
        '**How to authenticate:**\n' +
        '1. Call `POST /api/auth/login` with your credentials.\n' +
        '2. Copy the `token` from the response.\n' +
        '3. Click the **Authorize** button (🔒) at the top of this page.\n' +
        '4. Enter `Bearer <your-token>` and click Authorize.',
      contact: {
        name: 'FitMirror Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/auth/login',
        },
      },
      schemas: {
        // ---- Shared / reused ----
        UserSummary: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Ayush Sharma' },
            email: { type: 'string', example: 'ayush@example.com' },
            role: { type: 'string', enum: ['user', 'retailer'], example: 'user' },
            photoUrl: { type: 'string', nullable: true, example: '/uploads/users/photo.jpg' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { '$ref': '#/components/schemas/UserSummary' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        Garment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
            title: { type: 'string', example: 'Classic Blue Jeans' },
            description: { type: 'string', example: 'Slim-fit blue denim jeans' },
            category: { type: 'string', example: 'Pants' },
            price: { type: 'number', example: 1299 },
            size: { type: 'string', example: 'M' },
            availableSizes: { type: 'array', items: { type: 'string' }, example: ['S', 'M', 'L', 'XL'] },
            imageUrl: { type: 'string', example: '/uploads/garments/jeans-blue.png' },
            purchaseUrl: { type: 'string', example: 'https://example.com/buy' },
            retailer: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Measurement: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            height: { type: 'number', example: 175, description: 'in cm' },
            weight: { type: 'number', example: 70, description: 'in kg' },
            chest: { type: 'number', example: 92, description: 'in cm' },
            waist: { type: 'number', example: 78, description: 'in cm' },
            hips: { type: 'number', example: 96, description: 'in cm' },
            shoulder: { type: 'number', example: 44, description: 'in cm' },
            preferredFit: { type: 'string', enum: ['tight', 'regular', 'oversized'], example: 'regular' },
          },
        },
        SizeRecommendation: {
          type: 'object',
          properties: {
            recommendedSize: { type: 'string', example: 'M' },
            fitAdvice: { type: 'string', example: 'Regular fit suits your measurements' },
          },
        },
        SavedLook: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            name: { type: 'string', example: 'My Summer Look' },
            garments: { type: 'array', items: { '$ref': '#/components/schemas/Garment' } },
            isPublic: { type: 'boolean', example: true },
            previewUrl: { type: 'string', example: '' },
            shareToken: { type: 'string', example: 'x4k9m2zy1lp3' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            recipient: { type: 'string' },
            title: { type: 'string', example: 'Summer Sale!' },
            message: { type: 'string', example: 'Get 30% off on summer garments.' },
            read: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Validation error' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Register, login, Firebase token exchange, current user profile' },
      { name: 'Garments', description: 'Garment catalog — public reads, retailer-only writes' },
      { name: 'Measurements', description: 'Body measurements (all protected)' },
      { name: 'Recommendations', description: 'Rule-based garment recommendations (all protected)' },
      { name: 'Saved Looks', description: 'Saved outfit looks — public read by share token, protected writes' },
      { name: 'Analytics', description: 'Event tracking (semi-public) and retailer conversion metrics' },
      { name: 'Notifications', description: 'In-app notifications with Socket.io delivery' },
      { name: 'User', description: 'User profile photo upload' },
    ],
    paths: {
      // =====================================================================
      // AUTHENTICATION
      // =====================================================================
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description:
            'Creates a new user account. All public registrations are forced to `role: "user"` ' +
            'regardless of any role field sent in the body.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Ayush Sharma' },
                    email: { type: 'string', format: 'email', example: 'ayush@example.com' },
                    password: { type: 'string', minLength: 6, example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Registration successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { '$ref': '#/components/schemas/AuthResponse' } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Validation error or email already exists', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login with email and password',
          description: 'Authenticates an existing user or retailer. Returns a JWT token.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'ayush@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { '$ref': '#/components/schemas/AuthResponse' } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            401: { description: 'Invalid email or password', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/auth/firebase': {
        post: {
          tags: ['Authentication'],
          summary: 'Exchange Firebase ID token for FitMirror JWT',
          description:
            'Accepts a Firebase ID token (from Firebase client SDK after Email/Password sign-in) ' +
            'and returns a FitMirror JWT. Auto-creates the user account if the email does not exist in MongoDB.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['idToken'],
                  properties: {
                    idToken: { type: 'string', example: '<firebase-id-token-from-client-sdk>' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Firebase authentication successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { '$ref': '#/components/schemas/AuthResponse' } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Missing idToken or Firebase account has no email', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            401: { description: 'Invalid or expired Firebase ID token', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            503: { description: 'Firebase Auth not configured on server', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current authenticated user',
          description: 'Returns the full profile of the currently authenticated user.',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile fetched',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { user: { '$ref': '#/components/schemas/UserSummary' } } } } },
                    ],
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },

      // =====================================================================
      // GARMENTS
      // =====================================================================
      '/api/garments': {
        get: {
          tags: ['Garments'],
          summary: 'Get all garments (public)',
          description:
            'Returns a paginated, filterable list of garments. Multiple query parameters are combined with AND logic.',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Case-insensitive exact match. E.g. Shirt, T-Shirt, Pants, Jacket, Dress, Suit, Other' },
            { name: 'size', in: 'query', schema: { type: 'string' }, description: 'Matches garment.size OR garment.availableSizes array. Case-insensitive. E.g. S, M, L, XL' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Regex search across title, description, and category' },
            { name: 'retailer', in: 'query', schema: { type: 'string' }, description: 'Filter by retailer MongoDB ObjectId' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 }, description: 'Results per page' },
          ],
          responses: {
            200: {
              description: 'Garments retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              garments: { type: 'array', items: { '$ref': '#/components/schemas/Garment' } },
                              pagination: {
                                type: 'object',
                                properties: {
                                  total: { type: 'integer' },
                                  page: { type: 'integer' },
                                  pages: { type: 'integer' },
                                  limit: { type: 'integer' },
                                },
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Garments'],
          summary: 'Create a new garment (retailer only)',
          description:
            'Creates a garment in the catalog. **Requires Bearer auth with a retailer account.** ' +
            'Upload the garment image using multipart/form-data with field name `image`.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'category', 'price', 'image'],
                  properties: {
                    title: { type: 'string', example: 'Classic White T-Shirt', description: 'Required. Non-empty.' },
                    category: { type: 'string', example: 'T-Shirt', description: 'Required. E.g. Shirt, T-Shirt, Pants, Jacket, Dress, Suit, Other' },
                    price: { type: 'number', example: 799, description: 'Required. Numeric >= 0' },
                    description: { type: 'string', example: 'A comfortable everyday white t-shirt' },
                    size: { type: 'string', example: 'M', description: 'Optional. Default size label. Defaults to M.' },
                    availableSizes: { type: 'string', example: 'S,M,L,XL', description: 'Optional. Comma-separated. Defaults to S,M,L,XL.' },
                    purchaseUrl: { type: 'string', example: 'https://example.com/buy' },
                    image: { type: 'string', format: 'binary', description: 'Required. Garment photo (PNG/JPG). Stored via Multer in backend/uploads/garments/.' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Garment created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { garment: { '$ref': '#/components/schemas/Garment' } } } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Validation error or missing image', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            403: { description: 'Not a retailer', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/garments/{id}': {
        get: {
          tags: ['Garments'],
          summary: 'Get garment by ID (public)',
          description: 'Returns a single garment by its MongoDB ObjectId. Retailer is populated with name and email.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId of the garment' },
          ],
          responses: {
            200: {
              description: 'Garment details fetched',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { garment: { '$ref': '#/components/schemas/Garment' } } } } },
                    ],
                  },
                },
              },
            },
            404: { description: 'Garment not found or invalid ObjectId', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
        put: {
          tags: ['Garments'],
          summary: 'Update a garment (retailer only, owner)',
          description:
            'Updates an existing garment. **Requires Bearer auth.** Only the owning retailer can update. ' +
            'All fields are optional. If a new `image` file is uploaded, the old one is deleted from disk.',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId of the garment' },
          ],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Updated Name', description: 'Cannot be empty if provided.' },
                    category: { type: 'string', example: 'Shirt', description: 'Cannot be empty if provided.' },
                    price: { type: 'number', example: 999, description: 'Numeric >= 0 if provided.' },
                    description: { type: 'string' },
                    size: { type: 'string', example: 'L' },
                    availableSizes: { type: 'string', example: 'M,L,XL,XXL', description: 'Comma-separated.' },
                    purchaseUrl: { type: 'string' },
                    image: { type: 'string', format: 'binary', description: 'Optional. Replaces the existing image.' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Garment updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { garment: { '$ref': '#/components/schemas/Garment' } } } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            403: { description: 'Not a retailer or not the owner', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            404: { description: 'Garment not found', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
        delete: {
          tags: ['Garments'],
          summary: 'Delete a garment (retailer only, owner)',
          description: 'Permanently deletes a garment and removes its image file from disk. Only the owning retailer can delete.',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId of the garment' },
          ],
          responses: {
            200: { description: 'Garment deleted successfully', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiSuccess' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            403: { description: 'Not a retailer or not the owner', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            404: { description: 'Garment not found', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },

      // =====================================================================
      // MEASUREMENTS
      // =====================================================================
      '/api/measurements': {
        get: {
          tags: ['Measurements'],
          summary: 'Get current user measurements',
          description:
            'Returns body measurements for the authenticated user and the computed size recommendation. ' +
            'Returns `null` for both if no measurements have been saved yet.',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Measurements retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              measurements: { '$ref': '#/components/schemas/Measurement', nullable: true },
                              sizeRecommendation: { '$ref': '#/components/schemas/SizeRecommendation', nullable: true },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
        put: {
          tags: ['Measurements'],
          summary: 'Create or update measurements (upsert)',
          description:
            'Creates or updates body measurements for the logged-in user. ' +
            'Returns the saved measurements and a computed size recommendation.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['height', 'weight', 'chest', 'waist', 'hips'],
                  properties: {
                    height: { type: 'number', example: 175, description: 'Required. In cm.' },
                    weight: { type: 'number', example: 70, description: 'Required. In kg.' },
                    chest: { type: 'number', example: 92, description: 'Required. In cm.' },
                    waist: { type: 'number', example: 78, description: 'Required. In cm.' },
                    hips: { type: 'number', example: 96, description: 'Required. In cm.' },
                    shoulder: { type: 'number', example: 44, description: 'Optional. In cm. Defaults to 44.' },
                    preferredFit: { type: 'string', enum: ['tight', 'regular', 'oversized'], example: 'regular', description: 'Optional. Defaults to regular.' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Measurements saved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              measurements: { '$ref': '#/components/schemas/Measurement' },
                              sizeRecommendation: { '$ref': '#/components/schemas/SizeRecommendation' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: 'Validation error (non-numeric values or invalid preferredFit)', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },

      // =====================================================================
      // RECOMMENDATIONS
      // =====================================================================
      '/api/recommendations': {
        get: {
          tags: ['Recommendations'],
          summary: 'Get recommended garments',
          description:
            'Returns garments recommended for the user based on their body measurements using a **rule-based** algorithm (not AI/ML). ' +
            'Returns empty `garments` array if no measurements have been saved.',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Optional. Filter recommended garments by category.' },
          ],
          responses: {
            200: {
              description: 'Recommended garments retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              recommendedSize: { type: 'string', example: 'M' },
                              fitAdvice: { type: 'string', example: 'Regular fit suits your measurements' },
                              garments: { type: 'array', items: { '$ref': '#/components/schemas/Garment' } },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/recommendations/size': {
        get: {
          tags: ['Recommendations'],
          summary: 'Get size recommendation only',
          description: 'Returns the computed size label (S/M/L/XL) and fit advice string based on the user\'s stored measurements.',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Size recommendation computed',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { recommendation: { '$ref': '#/components/schemas/SizeRecommendation' } } } } },
                    ],
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },

      // =====================================================================
      // SAVED LOOKS
      // =====================================================================
      '/api/saved-looks': {
        post: {
          tags: ['Saved Looks'],
          summary: 'Create a saved look',
          description:
            'Saves a new outfit look from one or more garment IDs. ' +
            'Automatically generates a unique `shareToken` for public sharing.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'garments'],
                  properties: {
                    name: { type: 'string', example: 'My Summer Look', description: 'Required. Non-empty.' },
                    garments: { type: 'array', items: { type: 'string' }, minItems: 1, example: ['64f1a2b3c4d5e6f7a8b9c0d2'], description: 'Required. Array of garment MongoDB ObjectIds (min 1).' },
                    isPublic: { type: 'boolean', example: true, description: 'Optional. Defaults to true.' },
                    previewUrl: { type: 'string', example: '', description: 'Optional. Canvas preview image URL or data URI.' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Look saved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { savedLook: { '$ref': '#/components/schemas/SavedLook' } } } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Validation error (missing name or empty garments)', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
        get: {
          tags: ['Saved Looks'],
          summary: 'Get my saved looks',
          description: 'Returns all saved looks belonging to the authenticated user, sorted by newest first. Garments are populated.',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Saved looks retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { savedLooks: { type: 'array', items: { '$ref': '#/components/schemas/SavedLook' } } } } } },
                    ],
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/saved-looks/{id}': {
        get: {
          tags: ['Saved Looks'],
          summary: 'Get saved look by ID or share token (semi-public)',
          description:
            'Returns a single saved look. The `id` parameter can be a MongoDB ObjectId OR a `shareToken` string. ' +
            'Public looks are viewable without authentication. Private looks require the owning user\'s token.',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId (24-hex) OR shareToken string' },
          ],
          responses: {
            200: {
              description: 'Saved look fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { savedLook: { '$ref': '#/components/schemas/SavedLook' } } } } },
                    ],
                  },
                },
              },
            },
            403: { description: 'Look is private and token is missing or belongs to a different user', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            404: { description: 'Saved look not found', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
        delete: {
          tags: ['Saved Looks'],
          summary: 'Delete a saved look',
          description: 'Permanently deletes a saved look. Only the owning user can delete.',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId of the saved look' },
          ],
          responses: {
            200: { description: 'Saved look deleted successfully', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiSuccess' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            403: { description: 'Not the owner', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            404: { description: 'Saved look not found', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },

      // =====================================================================
      // ANALYTICS
      // =====================================================================
      '/api/analytics/track': {
        post: {
          tags: ['Analytics'],
          summary: 'Track a try-on or purchase-click event (semi-public)',
          description:
            'Records a try-on or purchase-click event for a garment. ' +
            'Authentication is optional — if an Authorization header is provided the user is identified, otherwise `user` is stored as `null`.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['garmentId', 'eventType'],
                  properties: {
                    garmentId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2', description: 'MongoDB ObjectId of the garment' },
                    eventType: { type: 'string', enum: ['try_on', 'purchase_click'], example: 'try_on' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Analytics event tracked',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              event: {
                                type: 'object',
                                properties: {
                                  _id: { type: 'string' },
                                  garment: { type: 'string' },
                                  user: { type: 'string', nullable: true },
                                  retailer: { type: 'string' },
                                  eventType: { type: 'string' },
                                  createdAt: { type: 'string', format: 'date-time' },
                                },
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: 'Missing garmentId, missing eventType, or invalid eventType value', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            404: { description: 'Garment not found', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/analytics/conversions': {
        get: {
          tags: ['Analytics'],
          summary: 'Get conversion analytics (retailer only)',
          description:
            'Returns per-garment try-on counts, purchase-click counts, conversion rates, and overall totals ' +
            'for all garments belonging to the authenticated retailer.',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Conversion analytics fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              overall: {
                                type: 'object',
                                properties: {
                                  totalTryOns: { type: 'integer' },
                                  totalPurchaseClicks: { type: 'integer' },
                                  overallConversionRate: { type: 'string', example: '26.67%' },
                                  overallPercentage: { type: 'number', example: 26.67 },
                                },
                              },
                              garments: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    garmentId: { type: 'string' },
                                    title: { type: 'string' },
                                    imageUrl: { type: 'string' },
                                    category: { type: 'string' },
                                    price: { type: 'number' },
                                    tryOns: { type: 'integer' },
                                    purchaseClicks: { type: 'integer' },
                                    conversionRate: { type: 'string' },
                                    conversionPercentage: { type: 'number' },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            403: { description: 'Not a retailer', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },

      // =====================================================================
      // NOTIFICATIONS
      // =====================================================================
      '/api/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Get my notifications',
          description: 'Returns the latest 30 notifications for the authenticated user, sorted by newest first.',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Notifications retrieved',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { notifications: { type: 'array', items: { '$ref': '#/components/schemas/Notification' } } } } } },
                    ],
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/notifications/send': {
        post: {
          tags: ['Notifications'],
          summary: 'Send a notification to a user (retailer only)',
          description:
            'Stores a notification in MongoDB and emits it in real-time via Socket.io to the recipient\'s socket room.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['recipientId', 'title', 'message'],
                  properties: {
                    recipientId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'MongoDB ObjectId of the target user' },
                    title: { type: 'string', example: 'Summer Sale!' },
                    message: { type: 'string', example: 'Get 30% off on all summer garments today.' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Notification sent successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { notification: { '$ref': '#/components/schemas/Notification' } } } } },
                    ],
                  },
                },
              },
            },
            400: { description: 'Missing recipientId, title, or message', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            403: { description: 'Not a retailer', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/api/notifications/{id}/read': {
        put: {
          tags: ['Notifications'],
          summary: 'Mark a notification as read',
          description: 'Sets `read: true` on the notification. The notification must belong to the authenticated user.',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId of the notification' },
          ],
          responses: {
            200: {
              description: 'Notification marked as read',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      { properties: { data: { type: 'object', properties: { notification: { '$ref': '#/components/schemas/Notification' } } } } },
                    ],
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            404: { description: 'Notification not found or not owned by this user', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },

      // =====================================================================
      // USER
      // =====================================================================
      '/api/user/upload': {
        post: {
          tags: ['User'],
          summary: 'Upload full-body photo',
          description:
            'Uploads a full-body photo for the authenticated user\'s profile and virtual fitting room. ' +
            'The file is stored via Multer in `backend/uploads/` and the user\'s `photoUrl` is updated in MongoDB.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['photo'],
                  properties: {
                    photo: { type: 'string', format: 'binary', description: 'Required. Full-body photo (JPG/PNG). Field name must be "photo".' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User full-body photo uploaded successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { '$ref': '#/components/schemas/ApiSuccess' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              photoUrl: { type: 'string', example: '/uploads/users/1234567890-photo.jpg' },
                              user: { '$ref': '#/components/schemas/UserSummary' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: 'No file uploaded', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ApiError' } } } },
          },
        },
      },
    },
  },
  // No apis array needed — we define everything inline above
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

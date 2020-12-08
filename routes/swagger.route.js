const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const router = express.Router();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.1",
    info: {
      title: "Kiosk Backend API",
      version: "1.0.0",
      description: `<h4>Documentation of all APIs of Kiosk backend application which is required -
        <ul>
          <li>By kiosk frontend application</li>
          <li>By kiosk administrator panel</li>
          <li>To expose data to downstream system</li>
          <li>To fetch data from LIMS application</li>
        </ul>
        JSON Web Tokens (JWT) has been used for authentication and session management and API routes are protected with it.
        </h4> 
        `,
      contact: {
        name: "Mind Benders (Cognizant Lab Innovation Team)",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      servers: ["http://localhost:5000"],
    },
  },
  apis: [
    "./routes/swagger.route.js",
    "./routes/auth-route.js",
    "./routes/*.js",
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
router.use("/", swaggerUi.serve);

/**
 * @swagger
 *
 * /lims/api/docs:
 *   get:
 *     description: Use to get swagger documentation of the API
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", swaggerUi.setup(swaggerDocs));

module.exports = router;

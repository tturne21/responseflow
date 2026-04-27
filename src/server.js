import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import serviceRequestRoutes from './routes/serviceRequests.js';
import staffAssignmentRoutes from './routes/staffAssignments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Swagger docs
const swaggerDoc = YAML.load(join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  swaggerOptions: { persistAuthorization: true }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/staff-assignments', staffAssignmentRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'ResponseFlow API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ResponseFlow API running on port ${PORT}`));

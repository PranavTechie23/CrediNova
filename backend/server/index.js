const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const {
  validateCreditDecisionRequest,
  callSageMakerEndpoint,
  batchPredictions,
  modelPredictionToCreditResponse,
  persistPrediction
} = require('./creditModel');
const { getPastApplications, getApplicationById } = require('./applications');
const { getAuditTrail, clearAuditTrail, logDecision } = require('./auditTrail');
const { sendChatMessage } = require('./chatProxy');
const { shutdown } = require('./database');
const { router: authRouter, authenticateToken } = require('./auth');

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'CrediNova backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/predict', authenticateToken, async (req, res) => {
  const { request, approvalThreshold } = req.body;
  if (!validateCreditDecisionRequest(request)) {
    return res.status(400).json({ error: 'Invalid credit decision payload' });
  }

  try {
    const prediction = await callSageMakerEndpoint(request, approvalThreshold ?? null);
    const application = await persistPrediction(request, prediction, req.user?.id || null);
    const response = modelPredictionToCreditResponse(prediction);
    await logDecision(
      application.id,
      request,
      response,
      prediction.model_version,
      req.user?.id || null,
      req.user?.role || 'system',
      req.ip || null
    );
    return res.json(response);
  } catch (error) {
    console.error('Predict error:', error);
    return res.status(500).json({ error: 'Failed to evaluate credit decision' });
  }
});

app.post('/predict/batch', authenticateToken, async (req, res) => {
  const { requests, approvalThreshold } = req.body;
  if (!Array.isArray(requests) || !requests.every(validateCreditDecisionRequest)) {
    return res.status(400).json({ error: 'Invalid batch payload' });
  }

  try {
    const predictions = await batchPredictions(requests, approvalThreshold ?? null);
    const responses = await Promise.all(predictions.map(async (prediction, index) => {
      const response = modelPredictionToCreditResponse(prediction);
      const application = await persistPrediction(requests[index], prediction, req.user?.id || null);
      await logDecision(
        application.id,
        requests[index],
        response,
        prediction.model_version,
        req.user?.id || null,
        req.user?.role || 'system',
        req.ip || null
      );
      return response;
    }));
    return res.json(responses);
  } catch (error) {
    console.error('Batch predict error:', error);
    return res.status(500).json({ error: 'Failed to process batch predictions' });
  }
});

app.get('/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await getPastApplications();
    return res.json(applications);
  } catch (error) {
    console.error('Applications error:', error);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/applications/:id', authenticateToken, async (req, res) => {
  try {
    const application = await getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    return res.json(application);
  } catch (error) {
    console.error('Application by id error:', error);
    return res.status(500).json({ error: 'Failed to fetch application' });
  }
});

app.get('/audit', authenticateToken, async (req, res) => {
  try {
    const trail = await getAuditTrail();
    return res.json(trail);
  } catch (error) {
    console.error('Audit error:', error);
    return res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

app.delete('/audit', authenticateToken, async (req, res) => {
  try {
    await clearAuditTrail();
    return res.status(204).end();
  } catch (error) {
    console.error('Clear audit error:', error);
    return res.status(500).json({ error: 'Failed to clear audit trail' });
  }
});

async function shutdownServer() {
  console.log('Shutdown requested. Closing server and database connections...');
  server.close(async () => {
    await shutdown();
    process.exit(0);
  });
}

app.post('/chat', async (req, res) => {
  const { messages, userMessage } = req.body;
  if (!Array.isArray(messages) || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'Invalid chat payload' });
  }

  try {
    const answer = await sendChatMessage(messages, userMessage);
    return res.json({ answer });
  } catch (error) {
    console.error('Chat proxy error:', error);
    return res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

process.on('SIGTERM', shutdownServer);
process.on('SIGINT', shutdownServer);

module.exports = app;

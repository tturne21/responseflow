import { prisma } from '../repositories/prismaClient.js';

const validId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

export const getAll = async (req, res) => {
  const { status, priority } = req.query;
  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  const requests = await prisma.serviceRequest.findMany({
    where,
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(requests);
};

export const getOne = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const request = await prisma.serviceRequest.findUnique({
    where: { id: Number(req.params.id) },
    include: { customer: true, assignments: true }
  });
  if (!request) return res.status(404).json({ error: 'Service request not found' });
  res.json(request);
};

export const create = async (req, res) => {
  const { customerId, requestType, description, priority } = req.body;
  if (!customerId || !requestType) {
    return res.status(400).json({ error: 'customerId and requestType are required' });
  }
  const customer = await prisma.customer.findUnique({ where: { id: Number(customerId) } });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const request = await prisma.serviceRequest.create({
    data: { customerId: Number(customerId), requestType, description, priority }
  });
  res.status(201).json(request);
};

export const update = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const request = await prisma.serviceRequest.findUnique({
    where: { id: Number(req.params.id) },
    include: { assignments: true }
  });
  if (!request) return res.status(404).json({ error: 'Service request not found' });

  const { role, id: userId } = req.user;
  // Staff can only update their own assigned requests
  if (role === 'staff') {
    const isAssigned = request.assignments.some(a => a.staffUserId === userId);
    if (!isAssigned) return res.status(403).json({ error: 'You can only update your own assigned requests' });
  }

  const { status, priority, description } = req.body;
  // Business rule: cannot complete without assignment
  if (status === 'completed' && request.assignments.length === 0) {
    return res.status(400).json({ error: 'Cannot mark as completed without an assignment' });
  }
  // Business rule: cannot assign a cancelled request
  if (request.status === 'cancelled') {
    return res.status(400).json({ error: 'Cannot update a cancelled request' });
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: Number(req.params.id) },
    data: { status, priority, description }
  });
  res.json(updated);
};

export const remove = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const exists = await prisma.serviceRequest.findUnique({ where: { id: Number(req.params.id) } });
  if (!exists) return res.status(404).json({ error: 'Service request not found' });
  await prisma.serviceRequest.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
};

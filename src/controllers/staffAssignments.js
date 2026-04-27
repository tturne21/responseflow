import { prisma } from '../repositories/prismaClient.js';

const validId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

export const getAll = async (req, res) => {
  const { staffUserId } = req.query;
  const where = staffUserId ? { staffUserId: Number(staffUserId) } : {};
  const assignments = await prisma.staffAssignment.findMany({
    where,
    include: { serviceRequest: true, staffUser: { select: { id: true, name: true, role: true } } },
    orderBy: { assignedAt: 'desc' }
  });
  res.json(assignments);
};

export const getOne = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const assignment = await prisma.staffAssignment.findUnique({
    where: { id: Number(req.params.id) },
    include: { serviceRequest: true, staffUser: { select: { id: true, name: true, role: true } } }
  });
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  const { role, id: userId } = req.user;
  if (role === 'staff' && assignment.staffUserId !== userId) {
    return res.status(403).json({ error: 'You can only view your own assignments' });
  }
  res.json(assignment);
};

export const create = async (req, res) => {
  const { serviceRequestId, staffUserId, notes } = req.body;
  if (!serviceRequestId || !staffUserId) {
    return res.status(400).json({ error: 'serviceRequestId and staffUserId are required' });
  }
  const request = await prisma.serviceRequest.findUnique({ where: { id: Number(serviceRequestId) } });
  if (!request) return res.status(404).json({ error: 'Service request not found' });
  if (request.status === 'cancelled') {
    return res.status(400).json({ error: 'Cannot assign a cancelled request' });
  }

  const staffUser = await prisma.user.findUnique({ where: { id: Number(staffUserId) } });
  if (!staffUser) return res.status(404).json({ error: 'Staff user not found' });

  const assignment = await prisma.staffAssignment.create({
    data: { serviceRequestId: Number(serviceRequestId), staffUserId: Number(staffUserId), notes }
  });
  // Update request status to assigned
  await prisma.serviceRequest.update({
    where: { id: Number(serviceRequestId) },
    data: { status: 'assigned' }
  });
  res.status(201).json(assignment);
};

export const update = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const assignment = await prisma.staffAssignment.findUnique({ where: { id: Number(req.params.id) } });
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  const { role, id: userId } = req.user;
  if (role === 'staff' && assignment.staffUserId !== userId) {
    return res.status(403).json({ error: 'You can only update your own assignments' });
  }

  const { notes, completedAt } = req.body;
  const data = { notes };
  // Auto-set completedAt if marking complete
  if (completedAt || req.body.markComplete) {
    data.completedAt = new Date();
  }

  const updated = await prisma.staffAssignment.update({
    where: { id: Number(req.params.id) },
    data
  });
  res.json(updated);
};

export const remove = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const exists = await prisma.staffAssignment.findUnique({ where: { id: Number(req.params.id) } });
  if (!exists) return res.status(404).json({ error: 'Assignment not found' });
  await prisma.staffAssignment.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
};

import { prisma } from '../repositories/prismaClient.js';

const validId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

export const getAll = async (req, res) => {
  const { customerType } = req.query;
  const where = customerType ? { customerType } : {};
  const customers = await prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(customers);
};

export const getOne = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const customer = await prisma.customer.findUnique({ where: { id: Number(req.params.id) } });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
};

export const create = async (req, res) => {
  const { name, contactInfo, locationLabel, customerType } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const customer = await prisma.customer.create({
    data: { name, contactInfo, locationLabel, customerType }
  });
  res.status(201).json(customer);
};

export const update = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const exists = await prisma.customer.findUnique({ where: { id: Number(req.params.id) } });
  if (!exists) return res.status(404).json({ error: 'Customer not found' });
  const { name, contactInfo, locationLabel, customerType } = req.body;
  const customer = await prisma.customer.update({
    where: { id: Number(req.params.id) },
    data: { name, contactInfo, locationLabel, customerType }
  });
  res.json(customer);
};

export const remove = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const exists = await prisma.customer.findUnique({ where: { id: Number(req.params.id) } });
  if (!exists) return res.status(404).json({ error: 'Customer not found' });
  await prisma.customer.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
};

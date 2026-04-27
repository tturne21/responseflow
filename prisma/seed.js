import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash   = await bcrypt.hash('Admin1234!',   10);
  const managerHash = await bcrypt.hash('Manager1234!', 10);
  const staffHash   = await bcrypt.hash('Staff1234!',   10);
  const staff2Hash  = await bcrypt.hash('Staff1234!',   10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@responseflow.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@responseflow.com', passwordHash: adminHash, role: 'admin' }
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@responseflow.com' },
    update: {},
    create: { name: 'Manager User', email: 'manager@responseflow.com', passwordHash: managerHash, role: 'manager' }
  });

  // Primary staff user — used in most staff tests
  const staff1 = await prisma.user.upsert({
    where: { email: 'staff@responseflow.com' },
    update: {},
    create: { name: 'Staff User', email: 'staff@responseflow.com', passwordHash: staffHash, role: 'staff' }
  });

  // Second staff user — needed to test 403 (staff can't view another's assignment)
  const staff2 = await prisma.user.upsert({
    where: { email: 'staff2@responseflow.com' },
    update: {},
    create: { name: 'Staff User 2', email: 'staff2@responseflow.com', passwordHash: staff2Hash, role: 'staff' }
  });

  // ── Customers ──────────────────────────────────────────────────────────────
  const customer1 = await prisma.customer.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'John Smith', contactInfo: '555-0101', locationLabel: 'Table 4', customerType: 'guest' }
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Sarah Johnson', contactInfo: '555-0102', locationLabel: 'Room 12', customerType: 'member' }
  });

  // Customer 3 intentionally has NO service requests so it can be deleted in tests
  const customer3 = await prisma.customer.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Mike Davis', contactInfo: '555-0103', locationLabel: 'Aisle 3', customerType: 'shopper' }
  });

  // ── Service Requests ───────────────────────────────────────────────────────
  // Delete existing requests to keep IDs predictable on re-seed
  await prisma.staffAssignment.deleteMany({});
  await prisma.serviceRequest.deleteMany({});

  const req1 = await prisma.serviceRequest.create({
    data: {
      customerId: customer1.id,
      requestType: 'water_refill',
      description: 'Table 4 needs water refilled',
      priority: 'medium',
      status: 'open'
    }
  });

  const req2 = await prisma.serviceRequest.create({
    data: {
      customerId: customer2.id,
      requestType: 'check_request',
      description: 'Member requesting check for room service',
      priority: 'high',
      status: 'open'
    }
  });

  const req3 = await prisma.serviceRequest.create({
    data: {
      customerId: customer1.id,
      requestType: 'product_assistance',
      description: 'Customer needs help finding a product',
      priority: 'low',
      status: 'open'
    }
  });

  // ── Staff Assignments ──────────────────────────────────────────────────────
  // Assignment 1 — belongs to staff1 (used to test staff CAN view own)
  const assign1 = await prisma.staffAssignment.create({
    data: { serviceRequestId: req1.id, staffUserId: staff1.id, notes: 'Handle table water refill' }
  });
  await prisma.serviceRequest.update({ where: { id: req1.id }, data: { status: 'assigned' } });

  // Assignment 2 — belongs to staff2 (used to test staff CANNOT view another's)
  const assign2 = await prisma.staffAssignment.create({
    data: { serviceRequestId: req2.id, staffUserId: staff2.id, notes: 'Handle member check request' }
  });
  await prisma.serviceRequest.update({ where: { id: req2.id }, data: { status: 'assigned' } });

  console.log('\nSeed complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin:    admin@responseflow.com    / Admin1234!');
  console.log('  Manager:  manager@responseflow.com  / Manager1234!');
  console.log('  Staff:    staff@responseflow.com    / Staff1234!');
  console.log('  Staff 2:  staff2@responseflow.com   / Staff1234!');
  console.log('\nSeeded IDs:');
  console.log(`  Customers:    1 (John Smith), 2 (Sarah Johnson), 3 (Mike Davis - no requests)`);
  console.log(`  Requests:     ${req1.id} (assigned to staff), ${req2.id} (assigned to staff2), ${req3.id} (open, unassigned)`);
  console.log(`  Assignments:  ${assign1.id} (staff1), ${assign2.id} (staff2)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
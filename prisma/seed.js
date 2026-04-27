import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const adminHash = await bcrypt.hash('Admin1234!', 10);
  const managerHash = await bcrypt.hash('Manager1234!', 10);
  const staffHash = await bcrypt.hash('Staff1234!', 10);

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

  const staff1 = await prisma.user.upsert({
    where: { email: 'staff@responseflow.com' },
    update: {},
    create: { name: 'Staff User', email: 'staff@responseflow.com', passwordHash: staffHash, role: 'staff' }
  });

  // Create customers
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

  const customer3 = await prisma.customer.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Mike Davis', contactInfo: '555-0103', locationLabel: 'Aisle 3', customerType: 'shopper' }
  });

  // Create service requests
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
      customerId: customer3.id,
      requestType: 'product_assistance',
      description: 'Customer needs help finding a product',
      priority: 'low',
      status: 'open'
    }
  });

  // Create staff assignments
  await prisma.staffAssignment.create({
    data: {
      serviceRequestId: req1.id,
      staffUserId: staff1.id,
      notes: 'Assigned to handle table water refill'
    }
  });
  await prisma.serviceRequest.update({ where: { id: req1.id }, data: { status: 'assigned' } });

  await prisma.staffAssignment.create({
    data: {
      serviceRequestId: req2.id,
      staffUserId: staff1.id,
      notes: 'Handling member check request'
    }
  });
  await prisma.serviceRequest.update({ where: { id: req2.id }, data: { status: 'in_progress' } });

  console.log('Seed complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin:   admin@responseflow.com   / Admin1234!');
  console.log('  Manager: manager@responseflow.com / Manager1234!');
  console.log('  Staff:   staff@responseflow.com   / Staff1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

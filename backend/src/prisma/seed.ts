// Prisma Seed Script for DERTOUR Portfolio Control Tower
// Creates default users and sample data for development

import { PrismaClient, UserRole, InitiativeStatus, Priority, MilestoneStatus, RiskSeverity, RiskStatus, DecisionStatus, AgentActionStatus, NotificationType } from '@@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse dependency order)
  console.log('  Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.agentAction.deleteMany();
  await prisma.adoptionSignal.deleteMany();
  await prisma.benefit.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.dependency.deleteMany();
  await prisma.initiative.deleteMany();
  await prisma.user.deleteMany();
  await prisma.configuration.deleteMany();

  // Create default users
  console.log('  Creating default users...');
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dertour.de',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.SYSTEM_ADMIN,
      isActive: true,
    },
  });

  const executive = await prisma.user.create({
    data: {
      email: 'executive@dertour.de',
      passwordHash: hashedPassword,
      firstName: 'Executive',
      lastName: 'User',
      role: UserRole.EXECUTIVE,
      isActive: true,
    },
  });

  const finance = await prisma.user.create({
    data: {
      email: 'finance@dertour.de',
      passwordHash: hashedPassword,
      firstName: 'Finance',
      lastName: 'Manager',
      role: UserRole.FINANCE_USER,
      isActive: true,
    },
  });

  const teamMember = await prisma.user.create({
    data: {
      email: 'team@dertour.de',
      passwordHash: hashedPassword,
      firstName: 'Team',
      lastName: 'Member',
      role: UserRole.TEAM_MEMBER,
      isActive: true,
    },
  });

  console.log(`  ✓ Created ${4} users`);

  // Create sample initiatives
  console.log('  Creating sample initiatives...');
  
  const initiative1 = await prisma.initiative.create({
    data: {
      name: 'Digital Transformation 2024',
      description: 'Comprehensive digital transformation initiative for Group Functions',
      status: InitiativeStatus.ACTIVE,
      priority: Priority.CRITICAL,
      ownerId: executive.id,
      startDate: new Date('2024-01-01'),
      targetEndDate: new Date('2024-12-31'),
      budget: 2500000.00,
      department: 'IT',
    },
  });

  const initiative2 = await prisma.initiative.create({
    data: {
      name: 'Finance Process Automation',
      description: 'Automating key finance processes to improve efficiency',
      status: InitiativeStatus.ACTIVE,
      priority: Priority.HIGH,
      ownerId: finance.id,
      startDate: new Date('2024-03-01'),
      targetEndDate: new Date('2024-09-30'),
      budget: 500000.00,
      department: 'Finance',
    },
  });

  const initiative3 = await prisma.initiative.create({
    data: {
      name: 'HR System Modernization',
      description: 'Upgrading HR systems to cloud-based solution',
      status: InitiativeStatus.DRAFT,
      priority: Priority.MEDIUM,
      ownerId: teamMember.id,
      startDate: new Date('2024-06-01'),
      targetEndDate: new Date('2024-12-31'),
      budget: 800000.00,
      department: 'HR',
    },
  });

  console.log(`  ✓ Created ${3} initiatives`);

  // Create milestones
  console.log('  Creating milestones...');
  
  await prisma.milestone.createMany({
    data: [
      {
        name: 'Project Kickoff',
        description: 'Initial project kickoff meeting',
        status: MilestoneStatus.COMPLETED,
        targetDate: new Date('2024-01-15'),
        completedDate: new Date('2024-01-15'),
        initiativeId: initiative1.id,
        ownerId: executive.id,
      },
      {
        name: 'Requirements Gathering',
        description: 'Collect and document all requirements',
        status: MilestoneStatus.COMPLETED,
        targetDate: new Date('2024-02-28'),
        completedDate: new Date('2024-03-01'),
        initiativeId: initiative1.id,
        ownerId: teamMember.id,
      },
      {
        name: 'Implementation Phase 1',
        description: 'First phase of implementation',
        status: MilestoneStatus.IN_PROGRESS,
        targetDate: new Date('2024-06-30'),
        initiativeId: initiative1.id,
        ownerId: teamMember.id,
      },
      {
        name: 'Go-Live',
        description: 'Production deployment',
        status: MilestoneStatus.NOT_STARTED,
        targetDate: new Date('2024-11-30'),
        initiativeId: initiative1.id,
        ownerId: executive.id,
      },
    ],
  });

  console.log(`  ✓ Created ${4} milestones`);

  // Create risks
  console.log('  Creating risks...');
  
  await prisma.risk.createMany({
    data: [
      {
        title: 'Resource Availability',
        description: 'Key team members may not be available as planned',
        category: 'Resource',
        severity: RiskSeverity.HIGH,
        status: RiskStatus.MITIGATING,
        probability: 0.6,
        impactScore: 3.5,
        initiativeId: initiative1.id,
        ownerId: executive.id,
        mitigationTargetDate: new Date('2024-05-01'),
      },
      {
        title: 'Budget Overrun',
        description: 'Risk of exceeding allocated budget',
        category: 'Financial',
        severity: RiskSeverity.MEDIUM,
        status: RiskStatus.OPEN,
        probability: 0.4,
        impactScore: 2.5,
        initiativeId: initiative1.id,
        ownerId: finance.id,
      },
      {
        title: 'Vendor Delay',
        description: 'Third-party vendor may deliver late',
        category: 'External',
        severity: RiskSeverity.LOW,
        status: RiskStatus.RESOLVED,
        probability: 0.2,
        impactScore: 1.5,
        initiativeId: initiative2.id,
        ownerId: finance.id,
        resolvedDate: new Date('2024-04-01'),
      },
    ],
  });

  console.log(`  ✓ Created ${3} risks`);

  // Create decisions
  console.log('  Creating decisions...');
  
  await prisma.decision.createMany({
    data: [
      {
        title: 'Approve Cloud Provider Selection',
        description: 'Select AWS as primary cloud provider',
        decisionType: 'Strategic',
        status: DecisionStatus.APPROVED,
        initiativeId: initiative1.id,
        ownerId: executive.id,
        decidedAt: new Date('2024-02-15'),
      },
      {
        title: 'Hire Additional Developers',
        description: 'Approve hiring 3 additional senior developers',
        decisionType: 'Resource',
        status: DecisionStatus.PENDING,
        initiativeId: initiative1.id,
        ownerId: executive.id,
        implementationTargetDate: new Date('2024-05-01'),
      },
      {
        title: 'Budget Reallocation',
        description: 'Reallocate 100k from Q3 to Q4',
        decisionType: 'Financial',
        status: DecisionStatus.APPROVED,
        initiativeId: initiative2.id,
        ownerId: finance.id,
        decidedAt: new Date('2024-03-15'),
      },
    ],
  });

  console.log(`  ✓ Created ${3} decisions`);

  // Create benefits
  console.log('  Creating benefits...');
  
  await prisma.benefit.createMany({
    data: [
      {
        title: 'Cost Reduction',
        description: 'Annual cost savings from process automation',
        estimatedValue: 500000.00,
        realizedValue: 0,
        measurementUnit: 'EUR',
        initiativeId: initiative1.id,
      },
      {
        title: 'Efficiency Gain',
        description: 'Time saved per month on manual processes',
        estimatedValue: 120.0,
        realizedValue: 45.0,
        measurementUnit: 'hours',
        initiativeId: initiative2.id,
      },
      {
        title: 'FTE Reduction',
        description: 'Full-time equivalent positions reduced',
        estimatedValue: 2.5,
        realizedValue: 0,
        measurementUnit: 'FTE',
        initiativeId: initiative2.id,
      },
    ],
  });

  console.log(`  ✓ Created ${3} benefits`);

  // Create adoption signals
  console.log('  Creating adoption signals...');
  
  await prisma.adoptionSignal.createMany({
    data: [
      {
        metricName: 'training_completion',
        currentValue: 75.5,
        targetValue: 100.0,
        measuredAt: new Date('2024-04-01'),
        initiativeId: initiative1.id,
      },
      {
        metricName: 'tool_usage',
        currentValue: 45.0,
        targetValue: 80.0,
        measuredAt: new Date('2024-04-01'),
        initiativeId: initiative1.id,
      },
      {
        metricName: 'process_adoption',
        currentValue: 60.0,
        targetValue: 90.0,
        measuredAt: new Date('2024-04-01'),
        initiativeId: initiative2.id,
      },
    ],
  });

  console.log(`  ✓ Created ${3} adoption signals`);

  // Create agent actions
  console.log('  Creating agent actions...');
  
  await prisma.agentAction.createMany({
    data: [
      {
        actionType: 'NOTIFY_OWNER',
        plan: 'Send notification to initiative owner about upcoming milestone',
        evidence: 'Milestone due in 7 days',
        confidenceScore: 0.95,
        status: AgentActionStatus.EXECUTED,
        initiativeId: initiative1.id,
        actorId: admin.id,
        executedAt: new Date('2024-04-20'),
      },
      {
        actionType: 'ESCALATE_EXECUTIVE',
        plan: 'Escalate high-risk item to executive team',
        evidence: 'Risk severity increased to HIGH',
        confidenceScore: 0.88,
        status: AgentActionStatus.PENDING,
        initiativeId: initiative1.id,
        actorId: admin.id,
      },
      {
        actionType: 'AUTO_APPROVE',
        plan: 'Auto-approve routine budget adjustment',
        evidence: 'Within approved variance threshold',
        confidenceScore: 0.92,
        status: AgentActionStatus.APPROVED,
        initiativeId: initiative2.id,
        actorId: admin.id,
        approverId: finance.id,
        approvedAt: new Date('2024-04-15'),
      },
    ],
  });

  console.log(`  ✓ Created ${3} agent actions`);

  // Create notifications
  console.log('  Creating notifications...');
  
  await prisma.notification.createMany({
    data: [
      {
        title: 'Welcome to Portfolio Control Tower',
        message: 'Your account has been created successfully.',
        type: NotificationType.INFO,
        isRead: true,
        recipientId: admin.id,
      },
      {
        title: 'Milestone Approaching',
        message: 'Implementation Phase 1 is due in 7 days.',
        type: NotificationType.WARNING,
        isRead: false,
        recipientId: executive.id,
        entityType: 'milestone',
        entityId: 3,
      },
      {
        title: 'Risk Escalated',
        message: 'Resource Availability risk has been escalated.',
        type: NotificationType.ERROR,
        isRead: false,
        recipientId: executive.id,
        entityType: 'risk',
        entityId: 1,
      },
      {
        title: 'Decision Approved',
        message: 'Your budget reallocation request has been approved.',
        type: NotificationType.SUCCESS,
        isRead: false,
        recipientId: finance.id,
        entityType: 'decision',
        entityId: 3,
      },
    ],
  });

  console.log(`  ✓ Created ${4} notifications`);

  // Create configurations
  console.log('  Creating configurations...');
  
  await prisma.configuration.createMany({
    data: [
      {
        key: 'app.name',
        value: 'DERTOUR Portfolio Control Tower',
        description: 'Application display name',
        category: 'general',
      },
      {
        key: 'app.version',
        value: '1.0.0',
        description: 'Application version',
        category: 'general',
      },
      {
        key: 'auth.jwt_expiry',
        value: '15',
        description: 'JWT token expiry in minutes',
        category: 'security',
      },
      {
        key: 'auth.refresh_expiry',
        value: '7',
        description: 'Refresh token expiry in days',
        category: 'security',
      },
      {
        key: 'notifications.enabled',
        value: 'true',
        description: 'Enable notification system',
        category: 'notifications',
      },
    ],
  });

  console.log(`  ✓ Created ${5} configurations`);

  // Create audit logs
  console.log('  Creating audit logs...');
  
  await prisma.auditLog.createMany({
    data: [
      {
        entityType: 'user',
        entityId: admin.id,
        action: 'CREATE',
        newValues: { email: admin.email, role: admin.role },
        actorId: admin.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Prisma Seed Script',
      },
      {
        entityType: 'initiative',
        entityId: initiative1.id,
        action: 'CREATE',
        newValues: { name: initiative1.name, status: initiative1.status },
        actorId: executive.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Prisma Seed Script',
      },
    ],
  });

  console.log(`  ✓ Created ${2} audit logs`);

  console.log('\n✅ Database seed completed successfully!');
  console.log('\nDefault login credentials:');
  console.log('  Email: admin@dertour.de');
  console.log('  Password: admin123');
  console.log('  (Same password for all demo accounts)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

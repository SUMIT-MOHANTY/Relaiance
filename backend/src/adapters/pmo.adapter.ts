/**
 * PMO (Project Management Office) Adapter
 * Provides mock data for portfolio initiatives
 */

export interface PMOInitiative {
  id: string;
  name: string;
  status: string;
  department: string;
  owner: string;
  budget: number;
}

const mockInitiatives: PMOInitiative[] = [
  {
    id: 'DERTOURG-001',
    name: 'Digital Transformation Initiative',
    status: 'ACTIVE',
    department: 'IT',
    owner: 'John Smith',
    budget: 2500000,
  },
  {
    id: 'DERTOURG-002',
    name: 'Customer Experience Enhancement',
    status: 'PLANNED',
    department: 'Marketing',
    owner: 'Sarah Johnson',
    budget: 1200000,
  },
  {
    id: 'DERTOURG-003',
    name: 'Finance Process Automation',
    status: 'ACTIVE',
    department: 'Finance',
    owner: 'Michael Chen',
    budget: 800000,
  },
  {
    id: 'DERTOURG-004',
    name: 'Supply Chain Optimization',
    status: 'AT_RISK',
    department: 'Operations',
    owner: 'Emily Davis',
    budget: 1500000,
  },
  {
    id: 'DERTOURG-005',
    name: 'Employee Wellness Program',
    status: 'COMPLETED',
    department: 'HR',
    owner: 'Robert Wilson',
    budget: 300000,
  },
];

/**
 * Fetch all portfolio initiatives
 */
export async function fetchPortfolioData(): Promise<PMOInitiative[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...mockInitiatives];
}

/**
 * Fetch a single initiative by ID
 */
export async function fetchInitiativeById(id: string): Promise<PMOInitiative | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  const initiative = mockInitiatives.find(i => i.id === id);
  return initiative || null;
}

/**
 * Fetch initiatives by department
 */
export async function fetchInitiativesByDepartment(department: string): Promise<PMOInitiative[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockInitiatives.filter(i => i.department.toLowerCase() === department.toLowerCase());
}

/**
 * Fetch initiatives by status
 */
export async function fetchInitiativesByStatus(status: string): Promise<PMOInitiative[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockInitiatives.filter(i => i.status.toLowerCase() === status.toLowerCase());
}

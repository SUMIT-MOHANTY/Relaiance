import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { JwtPayload } from '../services/auth.service';

// Resource types in the system
type ResourceType = 
  | 'initiatives' 
  | 'milestones' 
  | 'risks' 
  | 'decisions' 
  | 'benefits' 
  | 'adoptionSignals' 
  | 'dependencies' 
  | 'agentActions' 
  | 'auditLogs' 
  | 'users' 
  | 'configurations' 
  | 'notifications';

type ActionType = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Permission matrix definition
interface PermissionGrant {
  resource: ResourceType;
  action: ActionType;
  scope: 'any' | 'own';
}

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.TEAM_MEMBER,
  UserRole.FINANCE_USER,
  UserRole.EXECUTIVE,
  UserRole.SYSTEM_ADMIN,
];

// Permission grants for each role
const ROLE_PERMISSIONS: Record<UserRole, PermissionGrant[]> = {
  [UserRole.TEAM_MEMBER]: [
    // Can read own initiatives and related resources
    { resource: 'initiatives', action: 'read', scope: 'own' },
    { resource: 'milestones', action: 'read', scope: 'own' },
    { resource: 'risks', action: 'read', scope: 'own' },
    { resource: 'decisions', action: 'read', scope: 'own' },
    // Can create/update own milestones, risks, decisions, benefits, adoptionSignals
    { resource: 'milestones', action: 'create', scope: 'own' },
    { resource: 'milestones', action: 'update', scope: 'own' },
    { resource: 'risks', action: 'create', scope: 'own' },
    { resource: 'risks', action: 'update', scope: 'own' },
    { resource: 'decisions', action: 'create', scope: 'own' },
    { resource: 'decisions', action: 'update', scope: 'own' },
    { resource: 'benefits', action: 'create', scope: 'own' },
    { resource: 'benefits', action: 'update', scope: 'own' },
    { resource: 'adoptionSignals', action: 'create', scope: 'own' },
    { resource: 'adoptionSignals', action: 'update', scope: 'own' },
    // Can read notifications
    { resource: 'notifications', action: 'read', scope: 'own' },
    { resource: 'notifications', action: 'update', scope: 'own' },
  ],
  [UserRole.FINANCE_USER]: [
    // Can read any resource
    { resource: 'initiatives', action: 'read', scope: 'any' },
    { resource: 'milestones', action: 'read', scope: 'any' },
    { resource: 'risks', action: 'read', scope: 'any' },
    { resource: 'decisions', action: 'read', scope: 'any' },
    { resource: 'benefits', action: 'read', scope: 'any' },
    { resource: 'adoptionSignals', action: 'read', scope: 'any' },
    { resource: 'dependencies', action: 'read', scope: 'any' },
    { resource: 'agentActions', action: 'read', scope: 'any' },
    { resource: 'auditLogs', action: 'read', scope: 'any' },
    { resource: 'users', action: 'read', scope: 'any' },
    { resource: 'configurations', action: 'read', scope: 'any' },
    { resource: 'notifications', action: 'read', scope: 'any' },
    // Can create/update own decisions and risks
    { resource: 'decisions', action: 'create', scope: 'own' },
    { resource: 'decisions', action: 'update', scope: 'own' },
    { resource: 'risks', action: 'create', scope: 'own' },
    { resource: 'risks', action: 'update', scope: 'own' },
  ],
  [UserRole.EXECUTIVE]: [
    // Can read any resource
    { resource: 'initiatives', action: 'read', scope: 'any' },
    { resource: 'milestones', action: 'read', scope: 'any' },
    { resource: 'risks', action: 'read', scope: 'any' },
    { resource: 'decisions', action: 'read', scope: 'any' },
    { resource: 'benefits', action: 'read', scope: 'any' },
    { resource: 'adoptionSignals', action: 'read', scope: 'any' },
    { resource: 'dependencies', action: 'read', scope: 'any' },
    { resource: 'agentActions', action: 'read', scope: 'any' },
    { resource: 'auditLogs', action: 'read', scope: 'any' },
    { resource: 'users', action: 'read', scope: 'any' },
    { resource: 'configurations', action: 'read', scope: 'any' },
    { resource: 'notifications', action: 'read', scope: 'any' },
    // Can approve/reject decisions
    { resource: 'decisions', action: 'update', scope: 'any' },
    // Can trigger exports (represented as read with special handling)
    { resource: 'initiatives', action: 'manage', scope: 'any' },
  ],
  [UserRole.SYSTEM_ADMIN]: [
    // Full CRUD on all resources
    { resource: 'initiatives', action: 'manage', scope: 'any' },
    { resource: 'milestones', action: 'manage', scope: 'any' },
    { resource: 'risks', action: 'manage', scope: 'any' },
    { resource: 'decisions', action: 'manage', scope: 'any' },
    { resource: 'benefits', action: 'manage', scope: 'any' },
    { resource: 'adoptionSignals', action: 'manage', scope: 'any' },
    { resource: 'dependencies', action: 'manage', scope: 'any' },
    { resource: 'agentActions', action: 'manage', scope: 'any' },
    { resource: 'auditLogs', action: 'manage', scope: 'any' },
    { resource: 'users', action: 'manage', scope: 'any' },
    { resource: 'configurations', action: 'manage', scope: 'any' },
    { resource: 'notifications', action: 'manage', scope: 'any' },
  ],
};

/**
 * Check if a role has permission for a specific action on a resource
 */
function hasPermission(
  role: UserRole,
  resource: ResourceType,
  action: ActionType,
  isOwner: boolean = false
): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  // Check for manage permission (grants all actions)
  const hasManage = permissions.some(
    p => p.resource === resource && p.action === 'manage' && (p.scope === 'any' || (p.scope === 'own' && isOwner))
  );
  if (hasManage) return true;

  // Check for specific action permission
  return permissions.some(
    p => 
      p.resource === resource && 
      p.action === action && 
      (p.scope === 'any' || (p.scope === 'own' && isOwner))
  );
}

/**
 * Check if user has a specific role or higher in the hierarchy
 */
function hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

/**
 * Middleware factory to require specific roles
 * Usage: requireRole(UserRole.EXECUTIVE, UserRole.SYSTEM_ADMIN)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const userRole = req.user.role;
    const hasRequiredRole = roles.some(role => hasRoleOrHigher(userRole, role));

    if (!hasRequiredRole) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Middleware factory to require specific permission
 * Usage: requirePermission('initiatives', 'create')
 */
export function requirePermission(resource: ResourceType, action: ActionType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const userRole = req.user.role;
    // For simplicity, we assume 'any' scope check here
    // In production, you'd check ownership based on the specific resource
    const hasRequiredPermission = hasPermission(userRole, resource, action, false);

    if (!hasRequiredPermission) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user owns a resource
 * This should be used in combination with requirePermission for 'own' scoped permissions
 */
export function requireOwnership(getOwnerId: (req: Request) => Promise<number | null>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const ownerId = await getOwnerId(req);
    
    if (ownerId === null) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found',
        },
      });
      return;
    }

    // Admin can access any resource
    if (req.user.role === UserRole.SYSTEM_ADMIN) {
      next();
      return;
    }

    // Check if user owns the resource
    if (ownerId !== req.user.sub) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      });
      return;
    }

    next();
  };
}

export default { requireRole, requirePermission, requireOwnership };

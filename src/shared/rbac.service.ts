import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { Role } from '../utils-billing/entitties/role.entity';
import {
  Permission,
  PermissionAction,
  PermissionCategory,
} from '../utils-billing/entitties/permission.entity';
import { UserRole } from '../utils-billing/entitties/userRole.entity';
import { EntityUserProfile } from '../utils-billing/entitties/entityUserProfile.entity';
import { SYSTEM_ROLES, PERMISSIONS } from './decorators/auth.decorators';

export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  entityProfileId: string;
  permissionIds: string[];
}

export interface AssignRoleDto {
  roleId: string;
  entityUserProfileId?: string;
  entitySubscriberProfileId?: string;
  assignedByUserId: string;
  expiryDate?: Date;
}

@Injectable()
export class RbacService {
  private dbManager: EntityManager;

  constructor(private dataSource: DataSource) {
    this.dbManager = this.dataSource.manager;
  }

  /**
   * Initialize system permissions and default roles
   */
  async initializeSystemRbac(entityProfileId: string): Promise<void> {
    await this.dbManager.transaction(async (transactionManager) => {
      // Create system permissions if they don't exist
      await this.createSystemPermissions(transactionManager);

      // Create default roles if they don't exist
      await this.createDefaultRoles(entityProfileId, transactionManager);
    });
  }

  private async createSystemPermissions(
    transactionManager: EntityManager,
  ): Promise<void> {
    const permissionDefinitions = [
      // Dashboard
      {
        name: PERMISSIONS.DASHBOARD_VIEW,
        displayName: 'View Dashboard',
        category: PermissionCategory.DASHBOARD,
        action: PermissionAction.READ,
      },

      // System Administration
      {
        name: PERMISSIONS.SYSTEM_ADMIN,
        displayName: 'System Administration',
        category: PermissionCategory.SYSTEM_SETTINGS,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.RBAC_ADMIN,
        displayName: 'RBAC System Administration',
        category: PermissionCategory.SYSTEM_SETTINGS,
        action: PermissionAction.UPDATE,
      },

      // User Management
      {
        name: PERMISSIONS.USERS_CREATE,
        displayName: 'Create Users',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.USERS_READ,
        displayName: 'View Users',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.USERS_UPDATE,
        displayName: 'Update Users',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.USERS_DELETE,
        displayName: 'Delete Users',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.DELETE,
      },

      // Billing
      {
        name: PERMISSIONS.BILLING_CREATE,
        displayName: 'Create Bills',
        category: PermissionCategory.BILLING,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.BILLING_READ,
        displayName: 'View Bills',
        category: PermissionCategory.BILLING,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.BILLING_UPDATE,
        displayName: 'Update Bills',
        category: PermissionCategory.BILLING,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.BILLING_DELETE,
        displayName: 'Delete Bills',
        category: PermissionCategory.BILLING,
        action: PermissionAction.DELETE,
      },
      {
        name: PERMISSIONS.BILLING_APPROVE,
        displayName: 'Approve Bills',
        category: PermissionCategory.BILLING,
        action: PermissionAction.APPROVE,
      },

      // Properties
      {
        name: PERMISSIONS.PROPERTIES_CREATE,
        displayName: 'Create Properties',
        category: PermissionCategory.PROPERTY_MANAGEMENT,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.PROPERTIES_READ,
        displayName: 'View Properties',
        category: PermissionCategory.PROPERTY_MANAGEMENT,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.PROPERTIES_UPDATE,
        displayName: 'Update Properties',
        category: PermissionCategory.PROPERTY_MANAGEMENT,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.PROPERTIES_DELETE,
        displayName: 'Delete Properties',
        category: PermissionCategory.PROPERTY_MANAGEMENT,
        action: PermissionAction.DELETE,
      },

      // Payments
      {
        name: PERMISSIONS.PAYMENTS_CREATE,
        displayName: 'Create Payments',
        category: PermissionCategory.PAYMENTS,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.PAYMENTS_READ,
        displayName: 'View Payments',
        category: PermissionCategory.PAYMENTS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.PAYMENTS_UPDATE,
        displayName: 'Update Payments',
        category: PermissionCategory.PAYMENTS,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.PAYMENTS_DELETE,
        displayName: 'Delete Payments',
        category: PermissionCategory.PAYMENTS,
        action: PermissionAction.DELETE,
      },
      {
        name: PERMISSIONS.PAYMENTS_APPROVE,
        displayName: 'Approve Payments',
        category: PermissionCategory.PAYMENTS,
        action: PermissionAction.APPROVE,
      },

      // Reports
      {
        name: PERMISSIONS.REPORTS_VIEW,
        displayName: 'View Reports',
        category: PermissionCategory.REPORTS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.REPORTS_EXPORT,
        displayName: 'Export Reports',
        category: PermissionCategory.REPORTS,
        action: PermissionAction.EXPORT,
      },

      // Settings
      {
        name: PERMISSIONS.SETTINGS_READ,
        displayName: 'View Settings',
        category: PermissionCategory.SYSTEM_SETTINGS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.SETTINGS_UPDATE,
        displayName: 'Update Settings',
        category: PermissionCategory.SYSTEM_SETTINGS,
        action: PermissionAction.UPDATE,
      },

      // Notifications
      {
        name: PERMISSIONS.NOTIFICATIONS_READ,
        displayName: 'View Notifications',
        category: PermissionCategory.NOTIFICATIONS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.NOTIFICATIONS_CREATE,
        displayName: 'Create Notifications',
        category: PermissionCategory.NOTIFICATIONS,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.NOTIFICATIONS_UPDATE,
        displayName: 'Update Notifications',
        category: PermissionCategory.NOTIFICATIONS,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.NOTIFICATIONS_DELETE,
        displayName: 'Delete Notifications',
        category: PermissionCategory.NOTIFICATIONS,
        action: PermissionAction.DELETE,
      },
    ];

    for (const permDef of permissionDefinitions) {
      const existingPermission = await transactionManager.findOne(Permission, {
        where: { name: permDef.name },
      });

      if (!existingPermission) {
        const permission = transactionManager.create(Permission, permDef);
        await transactionManager.save(permission);
      }
    }
  }

  private async createDefaultRoles(
    entityProfileId: string,
    transactionManager: EntityManager,
  ): Promise<void> {
    const roleDefinitions = [
      {
        name: SYSTEM_ROLES.SUPER_ADMIN,
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: Object.values(PERMISSIONS),
      },
      {
        name: SYSTEM_ROLES.ADMIN,
        displayName: 'Administrator',
        description: 'Administrative access with most permissions',
        permissions: [
          PERMISSIONS.USERS_CREATE,
          PERMISSIONS.USERS_READ,
          PERMISSIONS.USERS_UPDATE,
          PERMISSIONS.BILLING_CREATE,
          PERMISSIONS.BILLING_READ,
          PERMISSIONS.BILLING_UPDATE,
          PERMISSIONS.BILLING_APPROVE,
          PERMISSIONS.PROPERTIES_CREATE,
          PERMISSIONS.PROPERTIES_READ,
          PERMISSIONS.PROPERTIES_UPDATE,
          PERMISSIONS.PAYMENTS_READ,
          PERMISSIONS.PAYMENTS_APPROVE,
          PERMISSIONS.REPORTS_VIEW,
          PERMISSIONS.REPORTS_EXPORT,
          PERMISSIONS.NOTIFICATIONS_READ,
          PERMISSIONS.NOTIFICATIONS_CREATE,
          PERMISSIONS.NOTIFICATIONS_UPDATE,
        ],
      },
      {
        name: SYSTEM_ROLES.BILLING_OFFICER,
        displayName: 'Billing Officer',
        description: 'Billing and payment management',
        permissions: [
          PERMISSIONS.BILLING_CREATE,
          PERMISSIONS.BILLING_READ,
          PERMISSIONS.BILLING_UPDATE,
          PERMISSIONS.PROPERTIES_READ,
          PERMISSIONS.PAYMENTS_CREATE,
          PERMISSIONS.PAYMENTS_READ,
          PERMISSIONS.PAYMENTS_UPDATE,
          PERMISSIONS.REPORTS_VIEW,
          PERMISSIONS.NOTIFICATIONS_READ,
        ],
      },
      {
        name: SYSTEM_ROLES.FIELD_OFFICER,
        displayName: 'Field Officer',
        description: 'Field operations and property management',
        permissions: [
          PERMISSIONS.PROPERTIES_CREATE,
          PERMISSIONS.PROPERTIES_READ,
          PERMISSIONS.PROPERTIES_UPDATE,
          PERMISSIONS.BILLING_READ,
          PERMISSIONS.PAYMENTS_READ,
          PERMISSIONS.NOTIFICATIONS_READ,
        ],
      },
      {
        name: SYSTEM_ROLES.CUSTOMER_SERVICE,
        displayName: 'Customer Service',
        description: 'Customer support and basic operations',
        permissions: [
          PERMISSIONS.PROPERTIES_READ,
          PERMISSIONS.BILLING_READ,
          PERMISSIONS.PAYMENTS_READ,
          PERMISSIONS.NOTIFICATIONS_READ,
          PERMISSIONS.NOTIFICATIONS_CREATE,
        ],
      },
      {
        name: SYSTEM_ROLES.VIEWER,
        displayName: 'Viewer',
        description: 'Read-only access to most data',
        permissions: [
          PERMISSIONS.PROPERTIES_READ,
          PERMISSIONS.BILLING_READ,
          PERMISSIONS.PAYMENTS_READ,
          PERMISSIONS.REPORTS_VIEW,
          PERMISSIONS.NOTIFICATIONS_READ,
        ],
      },
    ];

    for (const roleDef of roleDefinitions) {
      const existingRole = await transactionManager.findOne(Role, {
        where: { name: roleDef.name, entityProfileId },
      });

      if (!existingRole) {
        // Get permissions
        const permissions = await transactionManager.find(Permission, {
          where: { name: In(roleDef.permissions) },
        });

        const role = transactionManager.create(Role, {
          name: roleDef.name,
          displayName: roleDef.displayName,
          description: roleDef.description,
          entityProfileId,
          isSystemRole: true,
          permissions,
        });

        await transactionManager.save(role);
      }
    }
  }

  /**
   * Create a custom role
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.dbManager.transaction(async (transactionManager) => {
      const permissions = await transactionManager.find(Permission, {
        where: { id: In(createRoleDto.permissionIds) },
      });

      const role = transactionManager.create(Role, {
        name: createRoleDto.name,
        displayName: createRoleDto.displayName,
        description: createRoleDto.description,
        entityProfileId: createRoleDto.entityProfileId,
        permissions,
      });

      return await transactionManager.save(role);
    });
  }

  /**
   * Assign role to user
   */
  async assignRole(assignRoleDto: AssignRoleDto): Promise<UserRole> {
    const userRole = this.dbManager.create(UserRole, {
      roleId: assignRoleDto.roleId,
      entityUserProfileId: assignRoleDto.entityUserProfileId,
      entitySubscriberProfileId: assignRoleDto.entitySubscriberProfileId,
      assignedByUserId: assignRoleDto.assignedByUserId,
      expiryDate: assignRoleDto.expiryDate,
      isActive: true,
    });
    return await this.dbManager.save(userRole);
  }

  /**
   * Get user roles and permissions
   */
  async getUserRolesAndPermissions(
    profileId: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile',
  ) {
    const whereClause =
      profileType === 'entity_user_profile'
        ? { entityUserProfileId: profileId }
        : { entitySubscriberProfileId: profileId };

    const userRoles = await this.dbManager.find(UserRole, {
      where: { ...whereClause, isActive: true },
      relations: ['role', 'role.permissions'],
    });

    const roles = userRoles.map((ur) => ur.role);
    const permissions = roles.flatMap((role) => role.permissions);
    const uniquePermissions = permissions.filter(
      (permission, index, self) =>
        index === self.findIndex((p) => p.id === permission.id),
    );

    return {
      roles,
      permissions: uniquePermissions,
    };
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    profileId: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile',
    permissionName: string,
  ): Promise<boolean> {
    const { permissions } = await this.getUserRolesAndPermissions(
      profileId,
      profileType,
    );
    return permissions.some((permission) => permission.name === permissionName);
  }

  /**
   * Get all roles for an entity
   */
  async getRoles(entityProfileId: string): Promise<Role[]> {
    return this.dbManager.find(Role, {
      where: { entityProfileId, isActive: true },
      relations: ['permissions'],
    });
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    return this.dbManager.find(Permission, {
      where: { isActive: true },
    });
  }

  /**
   * Get all users in an entity with their roles
   *
   * NOTE: Subscriber profiles (service clients) are deliberately excluded —
   * they don't authenticate against the operator app and therefore don't
   * participate in RBAC role assignment.
   */
  async getEntityUsers(entityProfileId: string) {
    // Get all entity user profiles (operator staff only)
    const entityUsers = await this.dbManager.find(EntityUserProfile, {
      where: { entityProfileId },
      relations: ['userRoles', 'userRoles.role'],
    });

    const formatUser = (user: any, type: string) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileType: type,
      roles:
        user.userRoles
          ?.filter((ur: any) => ur.isActive)
          .map((ur: any) => ({
            id: ur.role.id,
            name: ur.role.name,
            displayName: ur.role.displayName,
            assignedAt: ur.createdAt,
          })) || [],
      createdAt: user.createdAt,
    });

    return {
      entityUsers: entityUsers.map((user) =>
        formatUser(user, 'entity_user_profile'),
      ),
    };
  }

  /**
   * Update user roles (replace all current roles with new ones)
   */
  async updateUserRoles(
    profileId: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile',
    roleIds: string[],
    assignedByUserId: string,
  ): Promise<void> {
    await this.dbManager.transaction(async (transactionManager) => {
      const whereClause =
        profileType === 'entity_user_profile'
          ? { entityUserProfileId: profileId }
          : { entitySubscriberProfileId: profileId };

      // Deactivate existing roles
      await transactionManager.update(UserRole, whereClause, {
        isActive: false,
      });

      // Add new roles
      for (const roleId of roleIds) {
        const userRole = transactionManager.create(UserRole, {
          roleId,
          ...(profileType === 'entity_user_profile'
            ? { entityUserProfileId: profileId }
            : { entitySubscriberProfileId: profileId }),
          assignedByUserId,
          isActive: true,
        });
        await transactionManager.save(userRole);
      }
    });
  }

  /**
   * Auto-assign default roles to existing users without roles
   */
  async autoAssignDefaultRoleToUser(
    profileId: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile',
    assignedByUserId?: string,
  ): Promise<{ roleAssigned: boolean; roleName?: string }> {
    try {
      // Check if user already has roles
      const existingRoles = await this.getUserRolesAndPermissions(
        profileId,
        profileType,
      );
      if (existingRoles.roles && existingRoles.roles.length > 0) {
        return { roleAssigned: false };
      }

      // Find appropriate default role based on profile type
      let defaultRoleName: string;
      if (profileType === 'entity_subscriber_profile') {
        defaultRoleName = SYSTEM_ROLES.CUSTOMER;
      } else {
        defaultRoleName = SYSTEM_ROLES.BILLING_OFFICER;
      }

      // Find the default role
      const defaultRole = await this.dbManager.findOne(Role, {
        where: { name: defaultRoleName, isActive: true },
      });

      if (!defaultRole) {
        console.warn(
          `Default role ${defaultRoleName} not found for auto-assignment`,
        );
        return { roleAssigned: false };
      }

      // Assign the default role
      const userRole = this.dbManager.create(UserRole, {
        roleId: defaultRole.id,
        ...(profileType === 'entity_user_profile'
          ? { entityUserProfileId: profileId }
          : { entitySubscriberProfileId: profileId }),
        isActive: true,
      });

      await this.dbManager.save(userRole);

      return { roleAssigned: true, roleName: defaultRoleName };
    } catch (error) {
      Logger.error('Error auto-assigning role to user:', error);
      return { roleAssigned: false };
    }
  }

  /**
   * Remove a specific role from a user
   */
  async removeUserRole(
    profileId: string,
    roleId: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile',
  ): Promise<void> {
    const whereClause = {
      roleId,
      ...(profileType === 'entity_user_profile'
        ? { entityUserProfileId: profileId }
        : { entitySubscriberProfileId: profileId }),
      isActive: true,
    };

    await this.dbManager.update(UserRole, whereClause, {
      isActive: false,
    });
  }

  /**
   * Get RBAC system status for an entity
   */
  async getRbacSystemStatus(entityProfileId: string): Promise<{
    initialized: boolean;
    rolesCount: number;
    permissionsCount: number;
    entityProfileId: string;
  }> {
    const [roles, permissions] = await Promise.all([
      this.getRoles(entityProfileId),
      this.getPermissions(),
    ]);

    return {
      initialized: roles.length > 0 && permissions.length > 0,
      rolesCount: roles.length,
      permissionsCount: permissions.length,
      entityProfileId,
    };
  }

  /**
   * Bulk update user roles - replaces all existing roles with new ones
   */
  async bulkUpdateUserRoles(
    profileId: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile',
    roleIds: string[],
    assignedByUserId: string,
  ): Promise<void> {
    await this.dbManager.transaction(async (transactionManager) => {
      // Deactivate all existing roles for this user
      const whereClause =
        profileType === 'entity_user_profile'
          ? { entityUserProfileId: profileId }
          : { entitySubscriberProfileId: profileId };

      await transactionManager.update(UserRole, whereClause, {
        isActive: false,
      });

      // Add new roles
      for (const roleId of roleIds) {
        const userRole = transactionManager.create(UserRole, {
          roleId,
          ...(profileType === 'entity_user_profile'
            ? { entityUserProfileId: profileId }
            : { entitySubscriberProfileId: profileId }),
          assignedByUserId,
          isActive: true,
        });
        await transactionManager.save(userRole);
      }
    });
  }

  /**
   * Get total number of roles across all entities (for system status)
   */
  async getTotalRoles(): Promise<number> {
    try {
      return await this.dbManager.count(Role);
    } catch (error) {
      console.error('Error getting total roles count:', error);
      return 0;
    }
  }

  /**
   * Get total number of permissions (for system status)
   */
  async getTotalPermissions(): Promise<number> {
    try {
      return await this.dbManager.count(Permission);
    } catch (error) {
      console.error('Error getting total permissions count:', error);
      return 0;
    }
  }

  /**
   * Set RBAC enabled/disabled state - for system-wide toggle
   * This is stored in a simple way for modularity and extensibility
   */
  async setRbacEnabled(enabled: boolean): Promise<void> {
    try {
      // For simplicity, we'll use a simple in-memory cache or environment variable approach
      // In a production system, this could be stored in a dedicated settings table
      process.env.RBAC_ENABLED = enabled.toString();
    } catch (error) {
      console.error('Error setting RBAC enabled state:', error);
      throw error;
    }
  }

  /**
   * Check if RBAC is enabled system-wide
   */
  async isRbacEnabled(): Promise<boolean> {
    try {
      const envValue = process.env.RBAC_ENABLED;
      if (envValue !== undefined) {
        return envValue === 'true';
      }

      // Default to false (disabled) for backward compatibility
      return false;
    } catch (error) {
      console.error('Error checking RBAC enabled state:', error);
      return false;
    }
  }

  /**
   * Check if RBAC system is initialized
   */
  async isSystemInitialized(): Promise<boolean> {
    try {
      const roleCount = await this.getTotalRoles();
      const permissionCount = await this.getTotalPermissions();
      return roleCount > 0 && permissionCount > 0;
    } catch (error) {
      console.error('Error checking system initialization:', error);
      return false;
    }
  }

  /**
   * Get the first available entity profile ID for initialization
   * This makes the system more modular by not requiring hardcoded IDs
   */
  async getFirstEntityProfileId(): Promise<string | null> {
    try {
      const entityProfile = await this.dbManager
        .getRepository('EntityProfile')
        .createQueryBuilder('entity')
        .select('entity.id')
        .orderBy('entity.id', 'ASC')
        .getOne();

      return entityProfile ? entityProfile.id : null;
    } catch (error) {
      console.error('Error getting first entity profile ID:', error);
      return null;
    }
  }
}

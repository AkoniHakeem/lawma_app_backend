import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { RbacService, CreateRoleDto, AssignRoleDto } from './rbac.service';
import { AuthTokenPayload } from '../lib/types';
import { GetAuthPayload } from './getAuthenticatedUserPayload.decorator';
import { IsAuthenticated } from './isAuthenticated.guard';
import { PermissionGuard } from './guards/permission.guard';
import { RequirePermissions, PERMISSIONS } from './decorators/auth.decorators';

export class CreateCustomRoleDto {
  name: string;
  displayName: string;
  description?: string;
  permissionIds: string[];
}

export class AssignUserRoleDto {
  roleId: string;
  entityUserProfileId?: string;
  entitySubscriberProfileId?: string;
  expiryDate?: Date;
}

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) { }

  /**
   * Get current user profile with roles and permissions.
   *
   * Reads the user's actual role assignments and permissions from the
   * database. If no roles are assigned (e.g. legacy account or freshly
   * created staff user), falls back to a minimal "staff" / "customer"
   * default so the user can still navigate the app, but the response
   * always reflects whatever has actually been assigned to them.
   */
  @Get('profile')
  @UseGuards(IsAuthenticated)
  async getCurrentUserProfile(@GetAuthPayload() authPayload: AuthTokenPayload) {
    if (!authPayload.userData) {
      throw new BadRequestException(
        'User data not found in authentication token',
      );
    }

    const profileType =
      authPayload.profile?.profileType || 'entity_user_profile';
    const profileId =
      authPayload.profile?.profileTypeId || authPayload.userData.id;

    // Try to load actual roles + permissions from the database.
    let roles: any[] = [];
    let permissions: any[] = [];

    try {
      const result = await this.rbacService.getUserRolesAndPermissions(
        profileId,
        profileType as 'entity_user_profile' | 'entity_subscriber_profile',
      );

      roles = (result.roles ?? []).map((role) => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isSystemRole: role.isSystemRole,
      }));

      permissions = (result.permissions ?? []).map((permission) => ({
        id: permission.id,
        name: permission.name,
        displayName: permission.displayName,
        category: permission.category,
        action: permission.action,
      }));
    } catch (err) {
      console.warn(
        'Failed to load roles/permissions for /rbac/profile, falling back to defaults:',
        err,
      );
    }

    // Fallback when the user has no roles assigned yet. Keeps existing
    // sessions working but does NOT pretend the user is a super-admin.
    if (roles.length === 0) {
      const isSubscriber = profileType === 'entity_subscriber_profile';
      roles = [
        {
          id: 'default-role',
          name: isSubscriber ? 'customer' : 'staff',
          displayName: isSubscriber ? 'Customer' : 'Staff Member',
          description:
            'Default role for users without explicit role assignments',
          isSystemRole: false,
        },
      ];

      const fallbackPermissions = [
        {
          id: '1',
          name: 'dashboard:view',
          displayName: 'View Dashboard',
          category: 'dashboard',
          action: 'view',
        },
        {
          id: '2',
          name: 'billing:read',
          displayName: 'View Bills',
          category: 'billing',
          action: 'read',
        },
        {
          id: '3',
          name: 'payments:read',
          displayName: 'View Payments',
          category: 'payments',
          action: 'read',
        },
        {
          id: '4',
          name: 'properties:read',
          displayName: 'View Properties',
          category: 'properties',
          action: 'read',
        },
      ];

      if (!isSubscriber) {
        fallbackPermissions.push(
          {
            id: '5',
            name: 'billing:create',
            displayName: 'Create Bills',
            category: 'billing',
            action: 'create',
          },
          {
            id: '6',
            name: 'billing:update',
            displayName: 'Update Bills',
            category: 'billing',
            action: 'update',
          },
          {
            id: '7',
            name: 'payments:create',
            displayName: 'Create Payments',
            category: 'payments',
            action: 'create',
          },
          {
            id: '8',
            name: 'properties:create',
            displayName: 'Create Properties',
            category: 'properties',
            action: 'create',
          },
          {
            id: '9',
            name: 'properties:update',
            displayName: 'Update Properties',
            category: 'properties',
            action: 'update',
          },
          {
            id: '10',
            name: 'users:read',
            displayName: 'View Users',
            category: 'users',
            action: 'read',
          },
          {
            id: '11',
            name: 'reports:view',
            displayName: 'View Reports',
            category: 'reports',
            action: 'view',
          },
        );
      }

      permissions = fallbackPermissions;
    }

    return {
      user: {
        id: authPayload.userData.id,
        firstName: authPayload.userData.firstName,
        lastName: authPayload.userData.lastName,
        email: authPayload.userData.email,
        profileType,
        profileId,
      },
      roles,
      permissions,
    };
  }

  /**
   * Initialize RBAC system with default permissions and roles
   * Allows public access only if system is not yet initialized
   */
  @Post('initialize')
  async initializeRbac() {
    try {
      // Check if system is already initialized
      const isInitialized = await this.rbacService.isSystemInitialized();

      if (isInitialized) {
        throw new BadRequestException(
          'RBAC system is already initialized. Only Super Admins can re-initialize.',
        );
      }

      // Get the first available entity profile ID from the database
      // This makes the system more flexible and avoids hardcoded IDs
      const entityId = await this.rbacService.getFirstEntityProfileId();

      if (!entityId) {
        return {
          message:
            'No entity profiles found. Please create an entity profile first.',
          success: false,
        };
      }

      await this.rbacService.initializeSystemRbac(entityId);

      return {
        message:
          'RBAC system initialized successfully - First time setup completed',
        entityId: entityId,
        success: true,
      };
    } catch (error) {
      console.error('Error initializing RBAC:', error);
      throw new BadRequestException(
        `Failed to initialize RBAC system: ${error.message}`,
      );
    }
  }

  /**
   * Initialize RBAC for a specific entity profile
   * Useful for adding roles to newly created entities
   */
  @Post('initialize/:entityProfileId')
  async initializeRbacForEntity(
    @Param('entityProfileId') entityProfileId: string,
  ) {
    try {
      await this.rbacService.initializeSystemRbac(entityProfileId);

      return {
        message: `RBAC roles initialized successfully for entity ${entityProfileId}`,
        entityProfileId: entityProfileId,
        success: true,
      };
    } catch (error) {
      console.error(
        `Error initializing RBAC for entity ${entityProfileId}:`,
        error,
      );
      throw new BadRequestException(
        `Failed to initialize RBAC for entity: ${error.message}`,
      );
    }
  }

  /**
   * Get all roles for the current entity
   * If no entity profile ID is found in token, defaults to the first entity
   */
  @Get('roles')
  async getRoles(@GetAuthPayload() authPayload: AuthTokenPayload) {
    let entityProfileId: string;

    // Try to get entityProfileId from token
    if (authPayload?.profile?.entityProfileId) {
      entityProfileId = authPayload.profile.entityProfileId;
    } else {
      // If not found in token, use the first available entity profile
      // This is useful for super admins or when managing system-wide roles
      const firstEntityId = await this.rbacService.getFirstEntityProfileId();

      if (!firstEntityId) {
        throw new BadRequestException('No entity profiles found in the system');
      }

      entityProfileId = firstEntityId;
    }

    return await this.rbacService.getRoles(entityProfileId);
  }

  /**
   * Get all permissions
   */
  @Get('permissions')
  async getPermissions() {
    return await this.rbacService.getPermissions();
  }

  /**
   * Get RBAC system status and configuration - PUBLIC ENDPOINT
   * This endpoint provides basic system status without requiring authentication
   * for better modularity and extensibility
   */
  @Get('status')
  async getRbacStatus() {
    try {
      // Return basic system status that doesn't require entity-specific data
      const totalRoles = await this.rbacService.getTotalRoles();
      const totalPermissions = await this.rbacService.getTotalPermissions();

      return {
        initialized: totalRoles > 0,
        rolesCount: totalRoles,
        permissionsCount: totalPermissions,
        systemReady: true,
      };
    } catch (error) {
      console.error('Error getting RBAC status:', error);
      return {
        initialized: false,
        rolesCount: 0,
        permissionsCount: 0,
        systemReady: false,
        error: 'Could not retrieve system status',
      };
    }
  }

  /**
   * Enable RBAC system-wide - Requires authentication only
   * Note: PermissionGuard is not used here to avoid chicken-and-egg problem
   */
  @Post('enable')
  @UseGuards(IsAuthenticated)
  async enableRbac(@GetAuthPayload() authPayload: AuthTokenPayload) {
    try {
      await this.rbacService.setRbacEnabled(true);
      return {
        success: true,
        message: 'RBAC system enabled successfully',
        enabled: true,
      };
    } catch (error) {
      console.error('Error enabling RBAC:', error);
      return {
        success: false,
        message: 'Failed to enable RBAC system',
        enabled: false,
        error: error.message,
      };
    }
  }

  /**
   * Disable RBAC system-wide - Requires authentication only
   * Note: PermissionGuard is not used here to avoid chicken-and-egg problem
   */
  @Post('disable')
  @UseGuards(IsAuthenticated)
  async disableRbac(@GetAuthPayload() authPayload: AuthTokenPayload) {
    try {
      await this.rbacService.setRbacEnabled(false);
      return {
        success: true,
        message: 'RBAC system disabled successfully',
        enabled: false,
      };
    } catch (error) {
      console.error('Error disabling RBAC:', error);
      return {
        success: false,
        message: 'Failed to disable RBAC system',
        enabled: true,
        error: error.message,
      };
    }
  }

  /**
   * Get RBAC enabled status - PUBLIC ENDPOINT
   */
  @Get('enabled')
  async getRbacEnabled() {
    try {
      const enabled = await this.rbacService.isRbacEnabled();
      return {
        enabled,
        success: true,
      };
    } catch (error) {
      console.error('Error getting RBAC enabled status:', error);
      return {
        enabled: false,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all users with their roles for management
   */
  @Get('users/management')
  @UseGuards(IsAuthenticated)
  async getUsersForManagement(@GetAuthPayload() authPayload: AuthTokenPayload) {
    if (!authPayload.profile) {
      throw new BadRequestException(
        'Profile data not found in authentication token',
      );
    }

    const entityProfileId = authPayload.profile.entityProfileId;
    if (!entityProfileId) {
      throw new BadRequestException(
        'Entity profile ID is required but not found in token',
      );
    }

    return await this.rbacService.getEntityUsers(entityProfileId);
  }

  /**
   * Create a new user role assignment
   */
  @Post('users/assign-role')
  @UseGuards(IsAuthenticated)
  async assignUserRole(
    @Body() assignRoleDto: AssignUserRoleDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    if (!authPayload.userData) {
      throw new BadRequestException(
        'User data not found in authentication token',
      );
    }

    const assignData: AssignRoleDto = {
      ...assignRoleDto,
      assignedByUserId: authPayload.userData.id,
    };

    return await this.rbacService.assignRole(assignData);
  }

  /**
   * Remove user role assignment
   */
  @Delete('users/:profileId/roles/:roleId')
  @UseGuards(IsAuthenticated)
  async removeUserRole(
    @Param('profileId') profileId: string,
    @Param('roleId') roleId: string,
    @Query('profileType')
    profileType: 'entity_user_profile' | 'entity_subscriber_profile',
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    if (!authPayload.userData) {
      throw new BadRequestException(
        'User data not found in authentication token',
      );
    }

    await this.rbacService.removeUserRole(profileId, roleId, profileType);

    return {
      message: `Role removed successfully`,
      success: true,
    };
  }
}

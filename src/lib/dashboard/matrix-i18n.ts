/** Stable key for `Dashboard.rolesPermissions.matrix.permissionNames.*` */
export function permissionRowKey(permission: string): string {
  return permission.trim().toLowerCase().replace(/\s+/g, "_");
}

/** Stable key for `Dashboard.rolesPermissions.matrix.columns.*` */
export function matrixRoleColumnKey(role: string): string {
  return role.trim().toLowerCase();
}

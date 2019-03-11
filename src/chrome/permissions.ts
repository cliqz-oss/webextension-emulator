
type Permissions = {
  origins?: string[],
  permissions?: string[],
}

export default function createPermissions(runtime: any) {
  const permissions = runtime.getManifest().permissions;
  return {
    contains(perm: Permissions, callback?: (result: boolean) => void) {
      let hasPermissions = true;
      perm.permissions.forEach((p) => {
        hasPermissions = hasPermissions && permissions.indexOf(p) !== -1;
      });
      callback && callback(hasPermissions);
      return Promise.resolve(hasPermissions);
    },
    getAll(callback?: (perms: Permissions) => void) {
      const permArray = permissions.reduce((obj, perm) => {
        if (perm.indexOf('//') > -1 || perm.indexOf('<') > -1) {
          obj.origins.push(perm);
        } else {
          obj.permissions.push(perm);
        }
        return obj;
      }, { origins: [], permissions: []});
      callback && callback(permArray);
      return Promise.resolve(permArray);
    },
    request(perm: Permissions, callback?: (granted: boolean) => void) {
      callback && callback(false);
      return Promise.resolve(false);
    },
    remove(perm: Permissions, callback?: (removed: boolean) => void) {
      callback && callback(false);
      return Promise.resolve(false);
    }
  }
}
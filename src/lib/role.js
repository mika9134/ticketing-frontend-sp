export function hasPrivilege(roles, requiredPrivilege) {

    const accessLevels = {
        deny: 0,
        view: 2,
        edit: 6,
        contribute: 7,
        manage: 15,
        export: 31,
    };

    const crudDigit = {
        C: 0,
        R: 1,
        U: 2,
        D: 3,
        E: 4
    };
    
    // Normalize roles to array in case a single role is passed
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    const requiredAccessLevel = 1 << crudDigit[requiredPrivilege];

    for (const role of roles) {
        const userAccessLevel = accessLevels[role] || 0;

        if (userAccessLevel & requiredAccessLevel) {
            return true;
        }
    }

    return false;
}

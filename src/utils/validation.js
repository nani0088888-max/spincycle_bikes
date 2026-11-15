function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateBike(body, isUpdate = false) {
  const errors = [];
  const allowed = ['name', 'type', 'status'];

  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) errors.push(`Unknown field: ${key}`);
  }

  if (!isUpdate || Object.hasOwn(body, 'name')) {
    if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string.');
  }
  if (!isUpdate || Object.hasOwn(body, 'type')) {
    if (!isNonEmptyString(body.type)) errors.push('type is required and must be a non-empty string.');
  }
  if (Object.hasOwn(body, 'status') && !['available', 'rented', 'maintenance'].includes(body.status)) {
    errors.push("status must be 'available', 'rented', or 'maintenance'.");
  }
  if (isUpdate && !['name', 'type', 'status'].some(k => Object.hasOwn(body, k))) {
    errors.push('Provide at least one field to update.');
  }
  return errors;
}

function validateRider(body, isUpdate = false) {
  const errors = [];
  const allowed = ['name', 'email', 'phone'];
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) errors.push(`Unknown field: ${key}`);
  }
  if (!isUpdate || Object.hasOwn(body, 'name')) {
    if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string.');
  }
  if (!isUpdate || Object.hasOwn(body, 'email')) {
    if (!isNonEmptyString(body.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push('A valid email address is required.');
    }
  }
  if (Object.hasOwn(body, 'phone') && typeof body.phone !== 'string') errors.push('phone must be a string.');
  if (isUpdate && !['name', 'email', 'phone'].some(k => Object.hasOwn(body, k))) {
    errors.push('Provide at least one field to update.');
  }
  return errors;
}

module.exports = { validateBike, validateRider };
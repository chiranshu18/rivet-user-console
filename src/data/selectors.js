export function normalizeId(id) {
  return String(id ?? '').trim().toLowerCase();
}

export function getUserById(users, id) {
  const target = normalizeId(id);
  return users.find((user) => user.user_id.toLowerCase() === target) ?? null;
}

export function getProfileByUserId(profiles, id) {
  const target = normalizeId(id);
  return profiles.find((profile) => profile.user_id.toLowerCase() === target) ?? null;
}

export function getSessionsByUserId(sessions, id) {
  const target = normalizeId(id);
  return sessions.filter((session) => session.user_id.toLowerCase() === target);
}

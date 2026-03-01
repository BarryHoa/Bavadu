/**
 * Sinh mật khẩu ngẫu nhiên: ít nhất 8 ký tự, có ký tự đặc biệt, chữ hoa, chữ thường, số.
 */
export function generateRandomPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digit = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digit + special;

  const pick = (s: string) => s.charAt(Math.floor(Math.random() * s.length));
  const parts = [pick(upper), pick(lower), pick(digit), pick(special)];
  for (let i = parts.length; i < Math.max(length, 8); i++) {
    parts.push(pick(all));
  }
  return parts
    .sort(() => Math.random() - 0.5)
    .join("");
}

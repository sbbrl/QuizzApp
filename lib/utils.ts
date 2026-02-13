export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar characters
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function generateUniqueCode(checkExists: (code: string) => Promise<boolean>): Promise<string> {
  let code = generateCode();
  let attempts = 0;
  
  while (await checkExists(code) && attempts < 10) {
    code = generateCode();
    attempts++;
  }
  
  if (attempts >= 10) {
    throw new Error('Failed to generate unique code');
  }
  
  return code;
}

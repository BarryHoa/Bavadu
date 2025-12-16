//========================================
// User Type
//========================================

export interface User {
  id: string; // uuid v7
  username: string;
  avatar?: string;
}

export interface UserLogin {
  userId: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  lastLoginAt: number; // unix timestamp (ms)
  lastLoginIp: string;
  lastLoginUserAgent: string;
  lastLoginLocation: string;
  lastLoginDevice: string;
  createdAt: number; // unix timestamp (ms)
  updatedAt: number; // unix timestamp (ms)
}

export interface UserInfo extends User {
  firstName: string;
  lastName: string;
  gender: string; // 'male', 'female', 'other'
  dateOfBirth: number; // unix timestamp (ms)
  bio: string;
  phones: string[];
  addresses: string[];
  emails: string[];
  status: string; // 'active', 'inactive', 'block'
  isVerified: boolean;
  createdAt: number; // unix timestamp (ms)
  updatedAt: number; // unix timestamp (ms)
  createdBy: string;
  updatedBy: string;
}

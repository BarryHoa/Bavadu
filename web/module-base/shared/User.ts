//========================================
// User Type
//========================================


export interface User {
  id: string; // uuid v7
  username: string;
  avatar?: string;
}

export interface UserInfo extends User {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
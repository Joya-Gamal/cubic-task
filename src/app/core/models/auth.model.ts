export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Bank Admin' | 'Relationship Manager' | 'Customer';
  cif?: string;

}

export interface LoginCredentials {
  email: string;
  password?: string;

}

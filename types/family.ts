// types/family.ts
export interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female';
  gibyGubayeId: string;
  phone: string;
  email: string;
  batch?: string;
}

export interface GrandParent {
  student: string; // Student ID
  role: 'grandfather' | 'grandmother';
}

export interface FamilyUnit {
  father: string; // Student ID
  mother: string; // Student ID
  children: string[]; // Student IDs
}

export interface Family {
  _id: string;
  title: string;
  location: string;
  familyDate: string;
  batchFilter?: string;
  familyLeader: Student;
  familyCoLeader: Student;
  familySecretary: Student;
  grandParents: Array<{
    student: Student;
    role: 'grandfather' | 'grandmother';
  }>;
  families: Array<{
    father: Student;
    mother: Student;
    children: Student[];
  }>;
  status: 'current' | 'finished';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  allStudents: Student[];
  batches: string[];
}
// Types
export interface Student {
  id: number;
  name: string;
  gender: 'Male' | 'Female';
  dob: string;
  class: 'Nursery' | 'UKG' | 'LKG' | 'First' | 'Second' | 'Third' | 'Fourth';
  parents_name: string;
  contact_info: string;
  town_id: number;
  town_name?: string;
  house: 'red' | 'green' | 'blue' | 'yellow' | 'All';
  fees_total?: number;
  total_fees_paid: number;
  is_bus_service_opted: boolean;
  bus_fees_amount: number;
  course_fees_amount: number;
  remarks?: string;
}

export interface Town {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  student_id: number;
  name: string;
  date: string;
  amount_paid: number;
  fee_type: 'mainFees' | 'busFees' | 'courseFees';
  student_name?: string;
  student_class?: string;
}

export const CLASSES = ['Nursery', 'UKG', 'LKG', 'First', 'Second', 'Third', 'Fourth'] as const;
export const GENDERS = ['Male', 'Female'] as const;
export const HOUSES = ['red', 'green', 'blue', 'yellow', 'All'] as const;
export const FEE_TYPES = ['mainFees', 'busFees', 'courseFees'] as const;

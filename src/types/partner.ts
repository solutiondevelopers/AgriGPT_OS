export interface PartnerAccount {
  id: string;
  ownerId: string;
  name: string;
  username: string;
  password: string;
  phone?: string;
  farmId: string;
  farmName?: string;
  compensationType: 'salary' | 'commission' | 'hybrid';
  salaryMonthly?: number;
  commissionPercent?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

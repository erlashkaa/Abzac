import api from './client';

export const storeApi = {
  topUpBalance: (amount: number | string) => api.post<{ balance: number | string }>('user/balance/topup', { amount }),
};


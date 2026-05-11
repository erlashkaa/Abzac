import api from './client';
export const storeApi = {
    topUpBalance: (amount) => api.post('user/balance/topup', { amount }),
};

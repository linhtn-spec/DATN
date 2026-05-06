import api from "../request/api";

export const getFinanceOverview = () => {
    return api.get("finance_overview");
};

export const getWithdrawalsHistory = () => {
    return api.get("withdrawals");
};

export const createWithdrawal = (data) => {
    return api.post("withdrawals", data);
};

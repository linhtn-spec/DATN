import { Router } from "express";
import { getFinanceOverview, getWithdrawalsHistory, createWithdrawal, lookupBankAccount } from "../../controllers/statitics_controller.js";

const router = Router();

router.get("/finance_overview", getFinanceOverview);
router.get("/withdrawals", getWithdrawalsHistory);
router.post("/withdrawals", createWithdrawal);
router.post("/lookup-bank-account", lookupBankAccount);

export default router;

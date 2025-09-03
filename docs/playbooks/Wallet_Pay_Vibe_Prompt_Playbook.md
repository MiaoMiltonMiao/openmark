> **Quick Start Mega Prompt**
>
> You are a professional developer. Create two files: `wallet_pay.py` and `vibe_pomodoro_deluxe.py`.  
> **wallet_pay.py**: Implements `best_payment(price, wallet)` optimizing in this order: minimize leftover coins (50/10/5/1), then overpay, then pieces. Reject any plan that gives & receives the same denomination. Validate change feasibility and redistribute if needed. Provide `coin_cli_with_bills()` for input and `format_plan()` for output. Prefer to use more coins in exact pay if it reduces leftovers.  
> **vibe_pomodoro_deluxe.py**: Pomodoro timer with keys p=Pause/Resume, s=Skip, q=Quit, w=Open wallet immediately. Robust import of `wallet_pay`. On w: pause timer, disable raw mode, run wallet CLI, then re-enable raw mode and resume.  
> Ensure pressing w accepts typing input in wallet, then resumes timer.  
> Sanity test: Wallet 1000:1, 500:2, 100:3, 50:4, 10:5, 5:6, 1:7; price=999 → exact-pay plan leaving 9 coins.

---

# Wallet Pay + Vibe Pomodoro — Minimal Prompt Playbook

## Goal  
Recreate the current working behavior with only the necessary prompts, in a few logical iterations.

---

## Context assumptions
- Two files kept in the same folder: `wallet_pay.py` and `vibe_pomodoro_deluxe.py`  
- Timer hotkeys:  
  - `p` = Pause/Resume  
  - `s` = Skip  
  - `q` = Quit  
  - `w` = Open wallet immediately (with working input)  
- Wallet denominations:  
  - Bills: 1000 / 500 / 100  
  - Coins: 50 / 10 / 5 / 1  

---

## Iteration 0 — Seed intent
**Prompt:**
> You are a professional developer. We’re building a wallet payment optimizer that minimizes leftover coins after payment (50/10/5/1), breaking ties by lower overpay, then fewer pieces.  
> Bills: 1000/500/100. Coins: 50/10/5/1.  
> Provide a single file `wallet_pay.py` with a CLI asking for counts and price, printing the plan with GIVE/CHANGE and final wallet.  
> Then provide a second file `vibe_pomodoro_deluxe.py` that imports `wallet_pay`, implements a Pomodoro timer with keys p/s/q/w, and when I press w it pauses raw mode, runs wallet CLI, then restores raw mode.

---

## Iteration 1 — Create `wallet_pay.py`
**Prompt:**
> Write `wallet_pay.py` implementing `best_payment(price, wallet)`:  
> - Optimize: minimize leftover coins, then overpay, then pieces.  
> - No same-denomination give & change; if unavoidable, skip that plan.  
> - Validate change feasibility; reject plans where exact change cannot be made under the constraint.  
> - Redistribute change to smaller denominations if overlap would occur.  
>  
> Include: `coin_cli_with_bills()` (interactive), `format_plan()` and clear printing.

---

## Iteration 2 — Improve DP
**Prompt:**
> In the exact-sum DP, prefer states that use MORE coin pieces (tie-breaker: fewer total pieces).  
> Keep global selection: minimize leftover coins, then overpay, then pieces.

---

## Iteration 3 — Optional 5-coin bias
**Prompt:**
> Add an optional mode to bias spending 5-coins: either coin weights (5 has higher weight) or a CLI flag `--prefer-coin 5`.  
> Do not break feasibility/overlap rules.

---

## Iteration 4 — Create `vibe_pomodoro_deluxe.py`
**Prompt:**
> Write `vibe_pomodoro_deluxe.py` that:  
> - Robustly imports `wallet_pay` by injecting the script’s folder into `sys.path`.  
> - Implements non-blocking key read (`cbreak` on Unix / `msvcrt` on Windows).  
> - Keys: p/s/q to control; w opens wallet immediately.  
> - On w: exit raw mode → run `wallet_pay.coin_cli_with_bills()` → re-enter raw mode; timer paused while wallet runs.

---

## Iteration 5 — Fix input() in wallet mode
**Prompt:**
> When w is pressed, ensure terminal raw mode is disabled before calling `input()`, then re-enabled afterward; add elapsed suspension so countdown doesn’t shrink.

---

## Golden sanity tests
1. Wallet: `1000:1, 500:2, 100:3, 50:4, 10:5, 5:6, 1:7`; Price=999 →  
   Expect an exact-pay plan; a valid optimum leaves **9 total coins** (e.g.,  
   Pay `500×1, 100×3, 50×3, 10×3, 5×3, 1×4` →  
   Leftover `50×1, 10×2, 5×3, 1×3`).  
2. Enforce no give & change overlap (e.g., do not pay 1000 and get 1000 back).  
3. Press w during timer: wallet input must accept typing; timer resumes after exit.

---

## Operating tips
- Keep both files in the same folder. Run:  
  ```bash
  python3 vibe_pomodoro_deluxe.py

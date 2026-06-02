# Security Polish Implementation Plan

**Goal:** Apply security review fixes and add flag emoji to language toggle.

**Tasks:** 4 small, independent changes, each committed separately.

---

### Task 1: Fix global error handler — lang attribute + Tailwind styles

**Objective:** Replace hardcoded `lang="bg"` with `lang="en"`, refactor inline styles to Tailwind using the existing design system.

**Files:**
- Modify: `src/app/global-error.tsx`

**Changes:**
- `lang="bg"` → `lang="en"` (English is the broader audience default)
- Replace all inline `style={{}}` with Tailwind classes matching the design system:
  - Background: `bg-[var(--navy-deep)]`
  - Text: `text-white` / `text-[var(--navy-light)]/70`
  - Button: `bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-bold rounded-xl`
  - Link button: `border-2 border-[var(--yellow-primary)] text-[var(--yellow-primary)]`
  - Font: `font-fraunces` for heading

**Commit:** `fix(ui): use Tailwind and correct lang in global error handler`

---

### Task 2: Fix contact form privacy notice wording

**Objective:** Change "agree to" → "acknowledge" to align with the legitimate interest legal basis (not consent).

**Files:**
- Modify: `messages/en.json` — `contact.form.privacyText`
- Modify: `messages/bg.json` — `contact.form.privacyText`

**Changes:**
- EN: `"By submitting this form you agree to our"` → `"By submitting this form you acknowledge our"`
- BG: `"С изпращането на формуляра приемате нашата"` → `"С изпращането на формуляра потвърждавате нашата"`

**Commit:** `fix(legal): align contact form wording with legitimate interest basis`

---

### Task 3: Add flag emoji to language toggle

**Objective:** Add 🇧🇬 and 🇬🇧 flags next to the locale abbreviations for visual recognition.

**Files:**
- Modify: `src/components/shared/LanguageToggle.tsx`

**Changes:**
- Bulgarian button: `БГ` → `🇧🇬 БГ`
- English button: `EN` → `🇬🇧 EN`
- Slightly increase padding (`px-2.5` → `px-3`) to accommodate the emoji width

**Commit:** `feat(ui): add flag emoji to language toggle`

---

### Task 4: Verify build passes

**Objective:** Confirm no regressions from the changes.

**Command:**
```bash
cd smiley-school && npm run build
```

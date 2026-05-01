"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthInput } from "@/components/ui/AuthInput";
import {
  AuthFormBanner,
  AuthSubmitButton,
  PasswordVisibilityToggle,
  TermsCheckbox,
} from "@/components/auth/shared";
import { EmailIcon, LockIcon, PersonIcon, PhoneIcon } from "@/components/ui/icons";
import { useRegisterForm } from "./useRegisterForm";

const TOTAL_STEPS = 3;

export function RegisterForm() {
  const t = useTranslations("Auth.forms.register");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);
  const { loading, error, agreedToTerms, setAgreedToTerms, handleSubmit } = useRegisterForm();

  function validateCurrentStep(form: HTMLFormElement): boolean {
    const stepPane = form.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if (!stepPane) return true;
    const inputs = stepPane.querySelectorAll<HTMLInputElement>("input[required]");
    for (const input of inputs) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return false;
      }
    }
    return true;
  }

  function goNext(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest("form");
    if (!form) return;
    if (!validateCurrentStep(form)) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full flex-col gap-2 min-[500px]:gap-3 sm:gap-3.5 md:gap-4"
    >
      {error ? <AuthFormBanner>{error}</AuthFormBanner> : null}

      <div
        data-step={0}
        className={`tott-step-pane ${step === 0 ? "tott-step-active" : ""} tott-auth-step tott-auth-step-1`}
      >
        <div className="grid grid-cols-1 gap-2 min-[500px]:grid-cols-2 min-[500px]:gap-3 md:gap-4">
          <AuthInput
            id="first_name"
            name="first_name"
            label={t("firstNameLabel")}
            placeholder={t("firstNamePlaceholder")}
            required
            autoComplete="given-name"
            icon={<PersonIcon />}
          />
          <AuthInput
            id="last_name"
            name="last_name"
            label={t("lastNameLabel")}
            placeholder={t("lastNamePlaceholder")}
            required
            autoComplete="family-name"
            icon={<PersonIcon />}
          />
        </div>
      </div>

      <div
        data-step={1}
        className={`tott-step-pane ${step === 1 ? "tott-step-active" : ""} tott-auth-step tott-auth-step-2`}
      >
        <div className="grid grid-cols-1 gap-2 min-[500px]:grid-cols-2 min-[500px]:gap-3 md:gap-4">
          <AuthInput
            id="email"
            name="email"
            type="email"
            label={t("emailLabel")}
            placeholder={t("emailPlaceholder")}
            required
            autoComplete="email"
            icon={<EmailIcon />}
          />
          <AuthInput
            id="phone_number"
            name="phone_number"
            type="tel"
            label={t("phoneLabel")}
            placeholder={t("phonePlaceholder")}
            autoComplete="tel"
            icon={<PhoneIcon />}
          />
        </div>
      </div>

      <div
        data-step={2}
        className={`tott-step-pane ${step === 2 ? "tott-step-active" : ""} tott-auth-step tott-auth-step-3`}
      >
        <div className="flex flex-col gap-2 min-[500px]:gap-3 md:gap-4">
          <AuthInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label={t("passwordLabel")}
            placeholder={t("passwordPlaceholder")}
            required
            minLength={8}
            autoComplete="new-password"
            icon={<LockIcon />}
            rightSlot={
              <PasswordVisibilityToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                showLabel={t("showPassword")}
                hideLabel={t("hidePassword")}
              />
            }
          />
          <TermsCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
        </div>
      </div>

      {/* Mobile-only progress dots + step navigation (<480px) */}
      <div
        className="tott-step-only-mobile tott-auth-step tott-auth-step-4 flex-col gap-2"
        aria-label={t("stepProgress", { current: step + 1, total: TOTAL_STEPS })}
      >
        <div className="flex items-center justify-center gap-1.5" aria-hidden>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-[#CBA158]"
                  : i < step
                    ? "w-1.5 bg-[#CBA158]/60"
                    : "w-1.5 bg-[color:var(--tott-auth-checkbox-border)]"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="shrink-0 rounded-md border border-[color:var(--tott-auth-checkbox-border)] px-3 py-2 text-[12px] font-medium text-[color:var(--tott-auth-subtitle)] transition-colors hover:bg-[color:var(--tott-auth-input-hover)]"
            >
              {t("stepBack")}
            </button>
          ) : null}
          {isLastStep ? (
            <div className="flex-1">
              <AuthSubmitButton loading={loading} loadingLabel={t("submitting")}>
                {t("submit")}
              </AuthSubmitButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 select-none rounded-md bg-[#CBA158] py-2 text-[13px] font-semibold text-black transition-[background-color,transform] duration-200 ease-out hover:brightness-[1.03] active:translate-y-px"
            >
              {t("stepNext")}
            </button>
          )}
        </div>
      </div>

      {/* Desktop-only submit (≥480px) — single-page form, one button */}
      <div className="tott-step-only-desktop tott-auth-step tott-auth-step-5">
        <AuthSubmitButton loading={loading} loadingLabel={t("submitting")}>
          {t("submit")}
        </AuthSubmitButton>
      </div>
    </form>
  );
}

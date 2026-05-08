import { useMemo, useState } from "react";
import BackButton from "../../../components/ui/BackButton/BackButton";
import Button from "../../../components/ui/Button/Button";
import { paths } from "../../../routes/paths";
import "./CursoSenai.css";

type FormState = {
  name: string;
  email: string;
  phone: string;
  state: string;
  sig2: string;
};

const BRAZIL_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

function onlyDigits(s: string): string {
  return s.replace(/[^\d]/g, "");
}

function isValidEmail(s: string): boolean {
  // simples e suficiente pro front
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function CursoSenai() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    state: "",
    sig2: "",
  });
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    email: false,
    phone: false,
    state: false,
    sig2: false,
  });

  const phoneDigits = useMemo(() => onlyDigits(form.phone), [form.phone]);
  const phoneInvalid =
    touched.phone && (phoneDigits.length < 10 || phoneDigits.length > 11);
  const emailInvalid = touched.email && !isValidEmail(form.email);
  const nameInvalid = touched.name && form.name.trim().length < 2;
  const stateInvalid = touched.state && !form.state;
  const sig2Invalid = touched.sig2 && !form.sig2.trim();

  const canSubmit =
    form.name.trim().length >= 2 &&
    isValidEmail(form.email) &&
    phoneDigits.length >= 10 &&
    phoneDigits.length <= 11 &&
    Boolean(form.state) &&
    Boolean(form.sig2.trim());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, state: true, sig2: true });
    if (!canSubmit) return;
    alert("Inscrição enviada! Em breve entraremos em contato.");
    setForm({ name: "", email: "", phone: "", state: "", sig2: "" });
    setTouched({ name: false, email: false, phone: false, state: false, sig2: false });
  };

  return (
    <div className="curso-senai-page hd-page-bg">
      <div className="curso-senai-topbar">
        <BackButton fallbackPath={paths.service} className="curso-senai-back" />
        <div className="curso-senai-brand">
          <div className="curso-senai-brand-title">HIDRODEMA</div>
          <div className="curso-senai-brand-subtitle">TERMOPLÁSTICOS</div>
        </div>
        <div className="curso-senai-topbar-spacer" />
      </div>

      <div className="curso-senai-shell">
        <div className="curso-senai-left">
          <div className="curso-senai-kicker">Inscrições abertas para o Curso:</div>
          <h1 className="curso-senai-title">
            Instalações
            <br />
            Termoplásticas
            <br />
            Industriais
          </h1>

          <p className="curso-senai-lead">
            Você conhece as vantagens de ser um profissional qualificado de termoplástico
            industrial?
          </p>

          <p className="curso-senai-copy">
            O curso oferecido em parceria entre o Hidrodema, SENAI, Amanco Wavin e Corzan é o
            único para adquirir novos aprendizados industriais e um mercado que se não para de
            crescer.
          </p>
        </div>

        <div className="curso-senai-right">
          <form className="curso-senai-form" onSubmit={onSubmit}>
            <div className="curso-senai-form-header">Preencha o formulário</div>

            <label className="curso-senai-field">
              <span className="curso-senai-label">
                Nome<span className="curso-senai-required">*</span>
              </span>
              <input
                className={`curso-senai-input ${nameInvalid ? "is-invalid" : ""}`}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                autoComplete="name"
              />
            </label>

            <label className="curso-senai-field">
              <span className="curso-senai-label">
                Email<span className="curso-senai-required">*</span>
              </span>
              <input
                className={`curso-senai-input ${emailInvalid ? "is-invalid" : ""}`}
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                autoComplete="email"
                inputMode="email"
              />
            </label>

            <label className="curso-senai-field">
              <span className="curso-senai-label">
                Telefone<span className="curso-senai-required">*</span>
              </span>
              <div className={`curso-senai-phone ${phoneInvalid ? "is-invalid" : ""}`}>
                <div className="curso-senai-phone-prefix" aria-hidden="true">
                  <span className="curso-senai-flag">🇧🇷</span>
                  <span className="curso-senai-ddi">+55</span>
                </div>
                <input
                  className="curso-senai-phone-input"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                />
              </div>
              {phoneInvalid && <div className="curso-senai-error">Número inválido</div>}
            </label>

            <label className="curso-senai-field">
              <span className="curso-senai-label">
                Estado<span className="curso-senai-required">*</span>
              </span>
              <select
                className={`curso-senai-input curso-senai-select ${stateInvalid ? "is-invalid" : ""}`}
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                onBlur={() => setTouched((p) => ({ ...p, state: true }))}
              >
                <option value="">Estado</option>
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </label>

            <label className="curso-senai-field">
              <span className="curso-senai-label">
                Sig nº 2<span className="curso-senai-required">*</span>
              </span>
              <input
                className={`curso-senai-input ${sig2Invalid ? "is-invalid" : ""}`}
                value={form.sig2}
                onChange={(e) => setForm((p) => ({ ...p, sig2: e.target.value }))}
                onBlur={() => setTouched((p) => ({ ...p, sig2: true }))}
              />
            </label>

            <Button
              type="submit"
              variant="secondary"
              disabled={!canSubmit}
              className="curso-senai-submit button--full-width"
            >
              Se inscreva agora!
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}


import { useState } from "react";
import BackButton from "../../../components/ui/BackButton/BackButton";
import Button from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import { paths } from "../../../routes/paths";
import {
  adminLinkUserToSeller,
  adminUnlinkUserSeller,
} from "../../../services/cloudFunctionsService";
import "./VinculoTecnico.css";

export default function VinculoTecnico() {
  const [userEmail, setUserEmail] = useState("");
  const [sellerExternalId, setSellerExternalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const doLink = async () => {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const r = await adminLinkUserToSeller({
        userEmail: userEmail.trim(),
        sellerExternalId: sellerExternalId.trim(),
      });
      setMsg(
        `Vínculo OK: uid=${r.targetUid} seller=${r.sellerExternalId ?? "—"} (${r.sellerCode ?? "—"})`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao vincular.");
    } finally {
      setLoading(false);
    }
  };

  const doUnlink = async () => {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const r = await adminUnlinkUserSeller({ userEmail: userEmail.trim() });
      setMsg(`Desvínculo OK: uid=${r.targetUid}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao desvincular.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vinculo-tecnico">
      <header className="vinculo-tecnico__header">
        <BackButton
          fallbackPath={paths.acessoExclusivo}
          className="vinculo-tecnico__back"
        />
        <h1 className="vinculo-tecnico__title">Vínculo técnico (CRM)</h1>
        <span />
      </header>

      <Card
        variant="service"
        title="Conciliação de usuário ↔ vendedor"
        textColor="#334155"
        backgroundColor="#f8fafc"
        className="vinculo-tecnico__panel"
      >
        <p className="vinculo-tecnico__hint">
          Informe o e-mail de login do colaborador e o <code>externalId</code> do
          vendedor (documento do <code>sellerDirectory</code>). O histórico fica em{" "}
          <code>sellerUserLinkHistory</code>.
        </p>

        <div className="vinculo-tecnico__form">
          <label className="vinculo-tecnico__label">
            E-mail do usuário
            <input
              className="vinculo-tecnico__input"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="nome@empresa.com.br"
              autoComplete="email"
            />
          </label>

          <label className="vinculo-tecnico__label">
            Seller externalId
            <input
              className="vinculo-tecnico__input"
              value={sellerExternalId}
              onChange={(e) => setSellerExternalId(e.target.value)}
              placeholder="ID do CRM (ex.: 35184)"
            />
          </label>
        </div>

        <div className="vinculo-tecnico__actions">
          <Button
            variant="primary"
            type="button"
            disabled={loading || !userEmail.trim() || !sellerExternalId.trim()}
            onClick={() => void doLink()}
          >
            {loading ? "Processando…" : "Vincular"}
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={loading || !userEmail.trim()}
            onClick={() => void doUnlink()}
          >
            {loading ? "Processando…" : "Desvincular"}
          </Button>
        </div>

        {msg && <p className="vinculo-tecnico__ok">{msg}</p>}
        {err && <p className="vinculo-tecnico__err">{err}</p>}
      </Card>
    </div>
  );
}


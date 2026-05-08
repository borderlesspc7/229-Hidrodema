import { useCallback, useEffect, useState } from "react";
import Button from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import { paths } from "../../../routes/paths";
import { syncSellerDirectoryExternal } from "../../../services/cloudFunctionsService";
import {
  listSellerDirectory,
  type SellerDirectoryDoc,
} from "../../../services/sellerDirectoryService";
import "./GestaoVendedores.css";
import BackButton from "../../../components/ui/BackButton/BackButton";

export default function GestaoVendedores() {
  const [rows, setRows] = useState<(SellerDirectoryDoc & { id: string })[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshLocal = useCallback(async () => {
    const list = await listSellerDirectory();
    setRows(list);
  }, []);

  useEffect(() => {
    void refreshLocal().catch(() => setRows([]));
  }, [refreshLocal]);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setSyncMsg(null);
    try {
      const r = await syncSellerDirectoryExternal();
      setSyncMsg(
        `${r.processed} registro(s) sincronizado(s) no diretório (fetched: ${r.fetched}).`
      );
      await refreshLocal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha na sincronização.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gestao-vendedores">
      <header className="gestao-vendedores__header">
        <BackButton
          fallbackPath={paths.acessoExclusivo}
          className="gestao-vendedores__back"
        />
        <h1 className="gestao-vendedores__title">Gestão de vendedores (API)</h1>
        <span />
      </header>

      <Card
        variant="service"
        title="Integração API Seller"
        textColor="#334155"
        backgroundColor="#f8fafc"
        className="gestao-vendedores__panel"
      >
        <p className="gestao-vendedores__hint">
          Sincronize a base externa para a coleção Firestore{" "}
          <code>sellerDirectory</code>. Mapeie{" "}
          <code>sellerExternalId</code> / <code>sellerCode</code> no documento do
          utilizador para cruzar com relatórios de visita.
        </p>
        <Button
          variant="primary"
          type="button"
          disabled={loading}
          onClick={() => void handleSync()}
        >
          {loading ? "Sincronizando…" : "Sincronizar da API Seller"}
        </Button>
        {syncMsg && <p className="gestao-vendedores__ok">{syncMsg}</p>}
        {error && <p className="gestao-vendedores__err">{error}</p>}
      </Card>

      <section className="gestao-vendedores__table-wrap">
        <h2>Diretório local ({rows.length})</h2>
        <table className="gestao-vendedores__table">
          <thead>
            <tr>
              <th>ID externo</th>
              <th>Código</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  Nenhum registro. Configure a API e sincronize.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.externalId}</td>
                  <td>{r.code ?? "—"}</td>
                  <td>{r.name ?? "—"}</td>
                  <td>{r.email ?? "—"}</td>
                  <td>{r.updatedAt?.slice(0, 19) ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

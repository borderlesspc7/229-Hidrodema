import Button from "../../../../../components/ui/Button/Button";
import { FiArrowLeft } from "react-icons/fi";

interface SectionHeaderProps {
  title: string;
  onBack: () => void;
}

export default function SectionHeader({ title, onBack }: SectionHeaderProps) {
  return (
    <div className="obras-projects-header">
      <h2>{title}</h2>
      <Button variant="primary" onClick={onBack} className="obras-back-to-menu">
        <FiArrowLeft size={16} />
        Voltar ao Menu
      </Button>
    </div>
  );
}

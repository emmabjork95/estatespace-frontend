import { useNavigate } from "react-router-dom";
import arrowBack from "../assets/arrow-back.svg";

type BackButtonProps = {
  to?: string;
  label?: string;
  className?: string;
};

export function BackButton({
  to,
  label = "Tillbaka",
  className = "",
}: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={`btn btn-ghost btn-back ${className}`}
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label={label}
      title={label}
    >
      <img src={arrowBack} alt="" className="btn-backIcon" />
    </button>
  );
}

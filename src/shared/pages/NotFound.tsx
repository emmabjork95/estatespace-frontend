import { useNavigate } from "react-router-dom";
import "./NotFound.css";
import "../components/ui/Buttons.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfoundPage">
      <div className="notfound-card">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-sub">
          Sidan du letar efter finns inte eller har flyttats.
        </p>

        <div className="notfound-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            Till startsidan
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => navigate(-1)}
          >
            Gå tillbaka
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
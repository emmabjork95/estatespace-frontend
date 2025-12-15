import "../styles/Home.css";
import heroImage from "../assets/background-twelve.png";
import myImage from "../assets/estate-logo-color-singles.svg";
import { Link } from "react-router";

export const Home = () => {
    return (
    <div
        className="hero"
        style={{ backgroundImage: `url(${heroImage})` }}
    >
        <div className="hero-logo">
            <img src={myImage} alt="Hero logo"/>
         </div>
         
        <div className="hero-btns">
            <Link to="/auth/login" className="btn btn-outline">LOG IN</Link>
            <Link to="/auth/signup" className="btn btn-filled">SIGN UP</Link>
        </div>
    </div>

    )
};
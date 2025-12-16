import { Link } from "react-router";


const Dashboard = () => {
  return (
    <div>
  <h1>Välkommen till din dashboard</h1>
   <div className="hero-btns">
     <Link to="/spaces/new">Create Spaces</Link>
     <Link to="/spaces/owned">My Spaces</Link>
     </div>
     </div>
  )
};

export default Dashboard;

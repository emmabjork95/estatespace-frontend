import { useEffect } from "react";
import { supabase } from "./supabaseClient"; 

function App() {
  useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase
        .from("estates") 
        .select("*")
        .limit(5);

      console.log("Supabase frontend test:", { data, error });
    };

    testSupabase();
  }, []);

  return <div>Hej från frontend</div>;
}

export default App;
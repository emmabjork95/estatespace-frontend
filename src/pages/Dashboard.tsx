import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Dashboard.css";

type SpaceCardBase = {
  spaces_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

type SpaceCard = SpaceCardBase & {
  coverImages: string[]; // max 3
  kind: "owned" | "joined";
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>("");
  const [mySpaces, setMySpaces] = useState<SpaceCard[]>([]);
  const [joinedSpaces, setJoinedSpaces] = useState<SpaceCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI-only search (filtrerar boards på namn)
  const [search, setSearch] = useState("");

  const filteredMySpaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mySpaces;
    return mySpaces.filter((s) => s.name.toLowerCase().includes(q));
  }, [mySpaces, search]);

  const filteredJoinedSpaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return joinedSpaces;
    return joinedSpaces.filter((s) => s.name.toLowerCase().includes(q));
  }, [joinedSpaces, search]);

  const pickFirst3 = (urls: (string | null | undefined)[]) =>
    urls.filter(Boolean).slice(0, 3) as string[];

  const attachCovers = async (spaces: SpaceCard[]) => {
    const ids = spaces.map((s) => s.spaces_id);
    if (ids.length === 0) return spaces;

    const { data: itemsData, error } = await supabase
      .from("items")
      .select("spaces_id, image_url, created_at")
      .in("spaces_id", ids)
      .order("created_at", { ascending: false });

    if (error) {
      return spaces.map((s) => ({ ...s, coverImages: [] }));
    }

    const map = new Map<string, string[]>();

    for (const row of itemsData ?? []) {
      const current = map.get(row.spaces_id) ?? [];
      if (row.image_url) current.push(row.image_url);
      map.set(row.spaces_id, current);
    }

    return spaces.map((s) => ({
      ...s,
      coverImages: pickFirst3(map.get(s.spaces_id) ?? []),
    }));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setErrorMessage(null);

      // Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setLoading(false);
        setErrorMessage("Du måste vara inloggad.");
        return;
      }

      // Profile -> namn
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("profiles_id", user.id)
        .single();

      setUserName(profile?.name ?? "vän");

      // Owned spaces
      const { data: ownedSpaces, error: ownedError } = await supabase
        .from("spaces")
        .select("spaces_id, name, description, created_at")
        .eq("profiles_id", user.id)
        .order("created_at", { ascending: false });

      if (ownedError) {
        setLoading(false);
        setErrorMessage(ownedError.message);
        return;
      }

      const ownedBase: SpaceCard[] = (ownedSpaces ?? []).map((s: SpaceCardBase) => ({
        ...s,
        coverImages: [],
        kind: "owned",
      }));

      // Joined spaces
      const { data: memberRows, error: memberError } = await supabase
        .from("space_members")
        .select(
          `
          spaces:spaces_id (
            spaces_id,
            name,
            description,
            created_at,
            profiles_id
          )
        `
        )
        .eq("profiles_id", user.id);

      if (memberError) {
        setLoading(false);
        setErrorMessage(memberError.message);
        return;
      }

      const joinedRaw: any[] =
        memberRows
          ?.map((row: any) => row.spaces)
          .filter((space: any) => space && space.profiles_id !== user.id) ?? [];

      const joinedBase: SpaceCard[] = joinedRaw.map((s: any) => ({
        spaces_id: s.spaces_id,
        name: s.name,
        description: s.description ?? null,
        created_at: s.created_at,
        coverImages: [],
        kind: "joined",
      }));

      // Attach covers
      const [ownedWithCovers, joinedWithCovers] = await Promise.all([
        attachCovers(ownedBase),
        attachCovers(joinedBase),
      ]);

      setMySpaces(ownedWithCovers);
      setJoinedSpaces(joinedWithCovers);

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p className="dashboard-loading">Loading...</p>;
  if (errorMessage) return <p className="error-message">{errorMessage}</p>;

  return (
    <div className="p-layout">
       <h1 className="dashboard-welcome">Välkommen, {userName}</h1>

      <main className="p-main">
        {/* Sökfält (Pinterest-stil) */}
        <div className="p-searchRow">
          <div className="p-search">
            <input
              className="p-searchInput"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sök bland dina spaces"
              aria-label="Sök bland dina spaces"
            />
          </div>
        </div>

        

        {/* Grid */}
        <h1 className="p-title-owned">Mina Spaces</h1>
        <section className="p-boardGrid" aria-label="Spaces">
          {/* Owned */}
          {filteredMySpaces.map((space) => (
            <button
              key={space.spaces_id}
              className="p-boardCard"
              type="button"
              onClick={() => navigate(`/spaces/${space.spaces_id}`)}
            >
              <div className="p-cover">
                <div className="p-coverBig">
                  {space.coverImages[0] ? (
                    <img src={space.coverImages[0]} alt="" />
                  ) : (
                    <div className="placeholder" />
                  )}
                </div>

                <div className="p-coverSmallCol">
                  <div className="p-coverSmall">
                    {space.coverImages[1] ? (
                      <img src={space.coverImages[1]} alt="" />
                    ) : (
                      <div className="placeholder" />
                    )}
                  </div>
                  <div className="p-coverSmall">
                    {space.coverImages[2] ? (
                      <img src={space.coverImages[2]} alt="" />
                    ) : (
                      <div className="placeholder" />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-boardName">{space.name}</div>
            </button>
          ))}

          {/* Create tile */}
          <button
            className="p-boardCard p-boardCard--create"
            type="button"
            onClick={() => navigate("/spaces/new")}
          >
            <div className="p-createTile">
              <span>+ <br></br> Nytt Space</span>
            </div>
          </button>
        </section>


        
          {/* Joined, ändra detta till Joined senare, nu är det owned */}
         <h1 className="p-title">Delade Space</h1>
        <section className="p-boardGrid" aria-label="Spaces">
  
          {filteredMySpaces.map((space) => (
            <button
              key={space.spaces_id}
              className="p-boardCard"
              type="button"
              onClick={() => navigate(`/spaces/${space.spaces_id}`)}
            >
              <div className="p-cover">
                <div className="p-coverBig">
                  {space.coverImages[0] ? (
                    <img src={space.coverImages[0]} alt="" />
                  ) : (
                    <div className="placeholder" />
                  )}
                </div>

                <div className="p-coverSmallCol">
                  <div className="p-coverSmall">
                    {space.coverImages[1] ? (
                      <img src={space.coverImages[1]} alt="" />
                    ) : (
                      <div className="placeholder" />
                    )}
                  </div>
                  <div className="p-coverSmall">
                    {space.coverImages[2] ? (
                      <img src={space.coverImages[2]} alt="" />
                    ) : (
                      <div className="placeholder" />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-boardName">{space.name}</div>
            </button>
          ))}
          
          {/* Create tile */}
          <button
            className="p-boardCard p-boardCard--create"
            type="button"
            onClick={() => navigate("/spaces/new")}
          >
            <div className="p-createTile">
              <span>Skapa</span>
            </div>
            <div className="p-boardName">Ny space</div>
            <div className="p-boardMeta">Skapa en ny anslagstavla</div>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

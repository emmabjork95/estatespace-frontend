import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { InviteMember } from "../../invites/pages/InviteMember";
import "../styles/SpaceMembers.css";
import "../../../styles/Buttons.css";

type SpaceRow = {
  spaces_id: string;
  name: string;
  profiles_id: string;
};

type MemberRow = {
  profiles_id: string;
  role: string | null;
};

type ProfileRow = {
  profiles_id: string;
  name: string | null;
  email: string | null;
};

type MemberUI = {
  profiles_id: string;
  role: string | null;
  name: string | null;
  email: string | null;
};

const SpaceMembers = () => {
  const { spacesID } = useParams();
  const navigate = useNavigate();

  const [space, setSpace] = useState<SpaceRow | null>(null);
  const [members, setMembers] = useState<MemberUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ownerId = space?.profiles_id ?? null;

  const owners = useMemo(
    () => members.filter((m) => m.profiles_id === ownerId),
    [members, ownerId]
  );
  const nonOwners = useMemo(
    () => members.filter((m) => m.profiles_id !== ownerId),
    [members, ownerId]
  );

  const fetchAll = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (!spacesID) {
      setLoading(false);
      setErrorMessage("Saknar space-id i URL:en.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("Du måste vara inloggad.");
      return;
    }

    const { data: spaceData, error: spaceError } = await supabase
      .from("spaces")
      .select("spaces_id, name, profiles_id")
      .eq("spaces_id", spacesID)
      .single();

    if (spaceError || !spaceData) {
      setLoading(false);
      setErrorMessage(spaceError?.message ?? "Kunde inte hämta space.");
      return;
    }

    if (spaceData.profiles_id !== user.id) {
      setLoading(false);
      setErrorMessage("Du har inte behörighet att se medlemmar i detta space.");
      return;
    }

    setSpace(spaceData);

    const { data: memberRows, error: membersError } = await supabase
      .from("space_members")
      .select("profiles_id, role")
      .eq("spaces_id", spacesID);

    if (membersError) {
      setLoading(false);
      setErrorMessage(membersError.message);
      return;
    }

    const membersRaw = (memberRows ?? []) as MemberRow[];
    const ids = membersRaw.map((m) => m.profiles_id);

    if (ids.length === 0) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data: profilesRows, error: profilesError } = await supabase
      .from("profiles")
      .select("profiles_id, name, email")
      .in("profiles_id", ids);

    if (profilesError) {
      setLoading(false);
      setErrorMessage(profilesError.message);
      return;
    }

    const profiles = (profilesRows ?? []) as ProfileRow[];

    const ui: MemberUI[] = membersRaw.map((m) => {
      const p = profiles.find((x) => x.profiles_id === m.profiles_id);
      return {
        profiles_id: m.profiles_id,
        role: m.role ?? null,
        name: p?.name ?? null,
        email: p?.email ?? null,
      };
    });

    setMembers(ui);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

  }, [spacesID]);

  const handleRemove = async (memberProfileId: string) => {
    if (!spacesID || !space) return;

    if (memberProfileId === space.profiles_id) {
      setErrorMessage("Du kan inte ta bort ägaren från spacet.");
      return;
    }

    const ok = window.confirm("Vill du ta bort denna medlem?");
    if (!ok) return;

    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("space_members")
      .delete()
      .eq("spaces_id", spacesID)
      .eq("profiles_id", memberProfileId);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    fetchAll();
  };

  return (
    <div className="spaceMembersPage">
      <div className="spaceMembersCard">
        <div className="spaceMembersTopRow">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => navigate(`/spaces/${spacesID}`)}
          >
            Tillbaka
          </button>
        </div>

        <div className="spaceMembersHeader">
          <h2>Medlemmar</h2>
          <p className="spaceMembersSub">
            Hantera medlemmar och bjud in nya till ditt space.
          </p>
        </div>

        {space && (
          <div className="spaceMembersInfoRow">
            <span className="spaceMembersInfoLabel">Space</span>
            <span className="spaceMembersInfoValue">{space.name}</span>
          </div>
        )}

        {(errorMessage || loading) && (
          <div
            className={`spaceMembersAlert ${
              errorMessage ? "spaceMembersAlert--error" : "spaceMembersAlert--info"
            }`}
          >
            <span className="spaceMembersAlertText">
              {errorMessage ?? "Laddar…"}
            </span>
            {errorMessage && (
              <button
                className="spaceMembersAlertClose"
                type="button"
                onClick={() => setErrorMessage(null)}
                aria-label="Stäng meddelande"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {space && (
          <>
            <div className="spaceMembersDivider" />

            <div className="spaceMembersSection">
              <div className="spaceMembersSectionHeader">
                <h3>Bjud in medlem</h3>
                <p>Skicka en inbjudan via e-post.</p>
              </div>

              <div className="spaceMembersInviteWrap">
                <InviteMember spacesID={space.spaces_id} />
              </div>
            </div>
          </>
        )}

        <div className="spaceMembersDivider" />

        <div className="spaceMembersSection">
          <div className="spaceMembersSectionHeader">
            <h3>Medlemmar</h3>
            <p>
              {members.length} st{" "}
              {members.length === 1 ? "medlem" : "medlemmar"} i detta space.
            </p>
          </div>

          {!loading && !errorMessage && (
            <>
              {members.length === 0 ? (
                <p className="spaceMembersEmpty">Inga medlemmar hittades.</p>
              ) : (
                <ul className="spaceMembersList">
             
                  {owners.map((m) => (
                    <li key={m.profiles_id} className="spaceMembersRow">
                      <div className="spaceMembersRowLeft">
                        <div className="spaceMembersNameRow">
                          <span className="spaceMembersName">
                            {m.name ?? "Okänt namn"}
                          </span>
                          <span className="spaceMembersBadge">Ägare</span>
                        </div>

                        <div className="spaceMembersMeta">
                          {m.email ?? "Ingen e-post"}
              
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled
                        title="Du kan inte ta bort ägaren."
                      >
                        Ta bort
                      </button>
                    </li>
                  ))}

 
                  {nonOwners.map((m) => (
                    <li key={m.profiles_id} className="spaceMembersRow">
                      <div className="spaceMembersRowLeft">
                        <div className="spaceMembersNameRow">
                          <span className="spaceMembersName">
                            {m.name ?? "Okänt namn"}
                          </span>
                          {m.role?.toLowerCase() === "member" && (
                            <span className="spaceMembersBadge spaceMembersBadge--muted">
                              Medlem
                            </span>
                          )}
                        </div>

                        <div className="spaceMembersMeta">
                          {m.email ?? "Ingen e-post"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(m.profiles_id)}
                        disabled={loading || m.profiles_id === space?.profiles_id}
                        className="btn btn-danger"
                      >
                        Ta bort
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceMembers;

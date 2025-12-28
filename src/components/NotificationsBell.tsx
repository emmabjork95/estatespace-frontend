import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

type NotificationRow = {
  notifications_id: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
  spaces_id: string | null;
  items_id: string | null;
};

function timeAgo(dateIso: string) {
  const d = new Date(dateIso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "nyss";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `${days} d`;
}

type NotificationsBellProps = {
  children: (args: {
    unreadCount: number;
    open: boolean;
    toggle: () => void;
  }) => ReactNode;
};

export function NotificationsBell({ children }: NotificationsBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const initRanRef = useRef(false);

  const unreadCount = useMemo(
    () => rows.filter((r) => !r.is_read).length,
    [rows]
  );

  // ✅ Alltid hämta aktuell user.id och använd den
  const fetchNotifications = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      console.log("getUser error:", userErr);
      setRows([]);
      setLoading(false);
      return;
    }

    if (!user) {
      setUserId(null);
      setRows([]);
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "notifications_id, message, type, is_read, created_at, spaces_id, items_id"
      )
      .eq("recipient_profiles_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    console.log("NOTIF fetch error:", error);
    console.log("NOTIF fetch data:", data);

    setLoading(false);

    if (error) {
      // om RLS eller annat – visa inget men behåll stabilt läge
      return;
    }

    setRows((data ?? []) as NotificationRow[]);
  };

  const markOneAsRead = async (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.notifications_id === id ? { ...r, is_read: true } : r))
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("notifications_id", id);

    if (error) fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    setRows((prev) => prev.map((r) => ({ ...r, is_read: true })));

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_profiles_id", userId)
      .eq("is_read", false);

    if (error) fetchNotifications();
  };

  const goToFromNotification = async (n: NotificationRow) => {
    if (!n.is_read) await markOneAsRead(n.notifications_id);

    if (n.items_id) {
      navigate(`/items/${n.items_id}`);
      setOpen(false);
      return;
    }

    if (n.spaces_id) {
      navigate(`/spaces/${n.spaces_id}`);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (initRanRef.current) return;
    initRanRef.current = true;

    const init = async () => {
      await fetchNotifications();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // städa gammal kanal
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      channelRef.current = supabase
        .channel(`notifications-live-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_profiles_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".notif-wrap")) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const toggle = () => {
    setOpen((v) => !v);
    fetchNotifications(); // ✅ hämtar alltid senaste för rätt user
  };

  return (
    <div className="notif-wrap">
      {children({ unreadCount, open, toggle })}

      {open && (
        <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="notif-header">
            <strong>Notiser</strong>
            <button
              type="button"
              className="notif-markall"
              onClick={markAllAsRead}
              disabled={rows.length === 0 || unreadCount === 0}
            >
              Markera alla som lästa
            </button>
          </div>

          {loading && <p className="notif-empty">Laddar...</p>}

          {!loading && rows.length === 0 && (
            <p className="notif-empty">Inga notiser ännu.</p>
          )}

          {!loading && rows.length > 0 && (
            <ul className="notif-list">
              {rows.map((n) => (
                <li
                  key={n.notifications_id}
                  className={`notif-item ${n.is_read ? "read" : "unread"}`}
                >
                  <button
                    type="button"
                    className="notif-item-btn"
                    onClick={() => goToFromNotification(n)}
                  >
                    <div className="notif-text">
                      <div className="notif-msg">
                        {n.message ?? "Du har en ny notis."}
                      </div>
                      <small>{timeAgo(n.created_at)}</small>
                    </div>
                  </button>

                  {!n.is_read && (
                    <button
                      type="button"
                      className="notif-readbtn"
                      onClick={() => markOneAsRead(n.notifications_id)}
                      title="Markera som läst"
                    >
                      ✓
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

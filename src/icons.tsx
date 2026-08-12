import type { ReactNode, SVGProps } from "react";

type IconName =
  | "home"
  | "folder"
  | "target"
  | "plus"
  | "search"
  | "video"
  | "activity"
  | "check"
  | "clock"
  | "database"
  | "trash"
  | "edit"
  | "play"
  | "pause"
  | "download"
  | "eye"
  | "eyeOff"
  | "chevron"
  | "cpu"
  | "refresh"
  | "x"
  | "alert"
  | "archive"
  | "map"
  | "users"
  | "chart"
  | "more";

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7"/></>,
    folder: <><path d="M3 6.5h7l2 2h9v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 10h18"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2Z"/></>,
    activity: <path d="M3 12h4l2.2-6 4.1 12 2.3-6H21"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
    trash: <><path d="M4 7h16M9 3h6l1 4H8Z"/><path d="m7 7 1 14h8l1-14M10 11v6M14 11v6"/></>,
    edit: <><path d="m4 16-1 5 5-1L20 8l-4-4Z"/><path d="m14.5 5.5 4 4"/></>,
    play: <path d="m8 5 11 7-11 7Z"/>,
    pause: <><path d="M8 5v14M16 5v14"/></>,
    download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M4 20h16"/></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="m3 3 18 18M9.5 6.3A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a14 14 0 0 1-2.1 2.7M6.2 7.1A15.3 15.3 0 0 0 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5"/></>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    cpu: <><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></>,
    refresh: <><path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 0-2 5"/></>,
    x: <path d="M5 5l14 14M19 5 5 19"/>,
    alert: <><path d="M12 3 2.5 20h19Z"/><path d="M12 9v5M12 17h.01"/></>,
    archive: <><path d="M4 7h16v13H4Z"/><path d="M3 3h18v4H3ZM9 11h6"/></>,
    map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z"/><path d="M8 3v15M16 6v15"/></>,
    users: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.4-4 2.4-6 6-6s5.6 2 6 6M15 14c3.4.2 5.2 2.2 5.5 5"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

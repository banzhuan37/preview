import type { ReactNode } from "react";
import { Icon } from "../icons";

export function Modal({ title, description, onClose, children, danger = false }: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`modal ${danger ? "danger-modal" : ""}`}>
      <header><div>{danger && <span className="danger-symbol"><Icon name="alert" /></span>}<div><h2>{title}</h2>{description && <p>{description}</p>}</div></div><button onClick={onClose}><Icon name="x" /></button></header>
      {children}
    </section>
  </div>;
}

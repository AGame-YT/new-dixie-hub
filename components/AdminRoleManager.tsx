"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { hasRole, roleLabels, roles, type Role } from "@/lib/roles";

type Member = {
  email: string;
  name?: string;
  role: Role;
  minimumRole: Role;
};

async function saveRole(email: string, role: Role) {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role })
  });
  const data = (await response.json()) as { member?: Member; error?: string };
  if (!response.ok || !data.member) throw new Error(data.error ?? "Could not save the role.");
  return data.member;
}

export function AdminRoleManager({ currentEmail }: { currentEmail?: string | null }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("TEACHER");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { members: Member[] }) => setMembers(data.members))
      .catch(() => setMessage("Could not load staff roles."));
  }, []);

  async function apply(targetEmail: string, nextRole: Role) {
    setBusy(true);
    setMessage("");
    try {
      const member = await saveRole(targetEmail, nextRole);
      setMembers((current) => {
        const others = current.filter((item) => item.email !== member.email);
        return member.role === "STUDENT" ? others : [...others, member];
      });
      setMessage(`${member.email} is now ${roleLabels[member.role].toLowerCase()}.`);
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the role.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...members].sort(
    (a, b) => roles.indexOf(b.role) - roles.indexOf(a.role) || a.email.localeCompare(b.email)
  );

  return (
    <div className="role-manager">
      <form
        className="role-add"
        onSubmit={async (event) => {
          event.preventDefault();
          if (await apply(email, role)) setEmail("");
        }}
      >
        <label>
          <span className="sr-only">School email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teacher@dixie.org.uk"
          />
        </label>
        <label>
          <span className="sr-only">Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <button type="submit" className="button primary small" disabled={busy}>
          <Icon name="user-plus" size={16} /> Add
        </button>
      </form>
      <p className="role-help">
        Teachers get the teacher view and can edit the bulletin. Admins can also
        manage roles, house points and analytics. Roles apply within a minute.
      </p>
      {message && (
        <p className="role-message" role="status">
          {message}
        </p>
      )}
      <ul className="role-list">
        {sorted.map((member) => {
          const isSelf = member.email === currentEmail?.toLowerCase();
          return (
            <li key={member.email}>
              <span className={`role-badge ${member.role.toLowerCase()}`}>
                <Icon name={member.role === "ADMIN" ? "shield" : "teacher"} size={16} />
              </span>
              <span className="role-person">
                <strong>{member.name ?? member.email}</strong>
                {member.name && <small>{member.email}</small>}
                {member.minimumRole !== "STUDENT" && (
                  <small>Set as {roleLabels[member.minimumRole].toLowerCase()} in server settings</small>
                )}
              </span>
              <select
                aria-label={`Role for ${member.email}`}
                value={member.role}
                disabled={busy || isSelf}
                title={isSelf ? "You can't change your own role" : undefined}
                onChange={(event) => apply(member.email, event.target.value as Role)}
              >
                {roles.map((option) => (
                  <option
                    key={option}
                    value={option}
                    disabled={!hasRole(option, member.minimumRole)}
                  >
                    {roleLabels[option]}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
        {sorted.length === 0 && <li className="admin-empty">No staff roles yet.</li>}
      </ul>
    </div>
  );
}

import { Ban, CheckCircle2, Shield, UserRound } from "lucide-react";
import { useState } from "react";
import {
  ErrorState,
  LoadingState,
  PageHeader,
  SearchField,
  Toast,
} from "../components/UI";
import { useRequest } from "../hooks/useRequest";
import { getId, initials, shortDate } from "../lib/utils";
import { userService } from "../services/userService";
import type { User } from "../types";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [updateError, setUpdateError] = useState("");
  const query = useRequest(userService.list);
  const filtered = (query.data ?? []).filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const update = async (id: string, isBlocked: boolean) => {
    setUpdatingId(id);
    setUpdateError("");
    try {
      await userService.setBlocked(id, isBlocked);
      setToast(isBlocked ? "User access blocked." : "User access restored.");
      await query.reload();
    } catch (cause) {
      setUpdateError(
        cause instanceof Error ? cause.message : "Unable to update user.",
      );
    } finally {
      setUpdatingId("");
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Users"
        description="View customer accounts and manage access to your store."
      />
      <div className="toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
        />
        <span className="result-count">{filtered.length} users</span>
      </div>
      <section className="panel data-panel">
        {query.isLoading ? (
          <LoadingState label="Loading users…" />
        ) : query.error ? (
          <ErrorState message={query.error.message} retry={query.reload} />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Access</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={getId(user)}>
                    <td>
                      <div className="customer-cell user-cell">
                        <span>{initials(user.name)}</span>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-chip ${user.role}`}>
                        {user.role === "admin" ? <Shield /> : <UserRound />}
                        {user.role}
                      </span>
                    </td>
                    <td>{shortDate(user.createdAt)}</td>
                    <td>
                      <span
                        className={`access-state ${user.isBlocked ? "blocked" : ""}`}
                      >
                        <i />
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>
                      {user.role !== "admin" && (
                        <button
                          className={`btn small ${user.isBlocked ? "secondary" : "soft-danger"}`}
                          disabled={updatingId === getId(user)}
                          onClick={() =>
                            void update(getId(user), !user.isBlocked)
                          }
                        >
                          {user.isBlocked ? <CheckCircle2 /> : <Ban />}
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {updateError && (
        <Toast
          type="error"
          message={updateError}
          onClose={() => setUpdateError("")}
        />
      )}{" "}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
}

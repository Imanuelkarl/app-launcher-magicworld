import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Apple,
  ArrowUpRight,
  Download,
  LogIn,
  Monitor,
  PackagePlus,
  Search,
  Terminal,
  UserPlus,
} from "lucide-react";
import { api } from "./api";
import type { AppInput, LauncherApp, User } from "./types";
import { Header } from "./components/Header";
import { AppCard } from "./components/AppCard";
import { AppIcon } from "./components/AppIcon";
const blank: AppInput = {
  name: "",
  description: "",
  type: "web",
  category: "General",
  platforms: ["Web"],
  webUrl: "",
  downloadUrl: "",
  currentVersion: "1.0.0",
  latestVersion: "1.0.0",
  status: "published",
  isNew: true,
  isFeatured: false,
};
const desktopDownloads = [
  { name: "Windows", file: "appLauncher.exe", icon: Monitor },
  { name: "macOS", file: "appLauncher.dmg", icon: Apple },
  { name: "Linux", file: "appLauncher.deb", icon: Terminal },
];
const auth = () => localStorage.removeItem("mw_token");
export function Hub() {
  const [apps, setApps] = useState<LauncherApp[]>([]),
    [search, setSearch] = useState("");
  useEffect(() => {
    api
      .publicApps()
      .then(setApps)
      .catch(() => setApps([]));
  }, []);
  const visible = useMemo(
    () =>
      apps.filter((a) =>
        `${a.name} ${a.description} ${a.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [apps, search],
  );
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-[#211838] via-[#40306e] to-magic py-24 text-white">
          <div className="shell grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold tracking-[.2em] text-violet-200">
                MAGIC WORLDS · APP HUB
              </p>
              <h1 className="mt-4 text-5xl font-extrabold leading-tight">
                Your universe of
                <br />
                <i className="font-serif font-medium">company tools.</i>
              </h1>
              <p className="mt-5 max-w-md leading-7 text-violet-100">
                Manage all your Magic Worlds software from one central hub.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/downloads/appLauncher.exe"
                  download
                  className="btn bg-white text-ink"
                >
                  <Download size={17} /> Download AppLauncher
                </a>
                <Link
                  to="/manage"
                  className="btn border border-white/30 bg-white/10 text-white"
                >
                  Open dashboard <ArrowUpRight size={17} />
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-violet-200">
                <span>Also available for:</span>
                {desktopDownloads.slice(1).map(({ name, file }) => (
                  <a
                    className="font-bold underline-offset-4 hover:underline"
                    href={`/downloads/${file}`}
                    download
                    key={file}
                  >
                    {name}
                  </a>
                ))}
                <span className="text-violet-300">·</span>
                <a
                  className="font-bold underline-offset-4 hover:underline"
                  href="/downloads/appLauncherVM"
                  download
                >
                  VM environment
                </a>
              </div>
            </div>
            <div className="hidden place-items-center md:grid">
              <div className="grid h-56 w-56 place-items-center rounded-full border border-violet-300/40 bg-white/10 shadow-[0_0_0_30px_rgba(255,255,255,.06)]">
                <AppIcon type="service" large />
              </div>
            </div>
          </div>
        </section>
        <section className="shell py-14">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <p className="text-xs font-bold tracking-widest text-magic">
                APP CATALOGUE
              </p>
              <h2 className="mt-1 text-3xl font-extrabold">
                Find your next tool.
              </h2>
            </div>
            <label className="relative block">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications"
              />
            </label>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((app) => (
              <AppCard app={app} key={app._id} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
export function Login({ setUser }: { setUser: (u: User) => void }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  const navigate = useNavigate();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.login(email, password);
      localStorage.setItem("mw_token", data.token);
      setUser(data.user);
      navigate("/manage");
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <>
      <Header />
      <main className="shell grid min-h-[calc(100vh-73px)] place-items-center">
        <form className="panel w-full max-w-md p-7" onSubmit={submit}>
          <p className="text-xs font-bold tracking-widest text-magic">
            SECURE TEAM ACCESS
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Welcome back.</h1>
          <p className="mt-2 text-sm text-slate-500">
            Use the company account provisioned by your administrator.
          </p>
          <label className="label mt-6">
            Company email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="label mt-4">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>
          )}
          <button className="btn-primary mt-6 w-full">
            <LogIn size={17} />
            Sign in
          </button>
        </form>
      </main>
    </>
  );
}
function AppForm({
  app,
  onSave,
}: {
  app: AppInput;
  onSave: (app: AppInput) => void;
}) {
  const [form, setForm] = useState(app);
  const set = <K extends keyof AppInput>(key: K, value: AppInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  return (
    <form
      className="panel p-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold">
          {app.name ? "Edit application" : "Publish application"}
        </h2>
        <PackagePlus className="text-magic" />
      </div>
      <label className="label mt-5">
        Application name
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </label>
      <label className="label mt-4">
        Description
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="label">
          Type
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value as AppInput["type"])}
          >
            {["web", "desktop", "mobile", "service"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Category
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          />
        </label>
      </div>
      <label className="label mt-4">
        Supported platforms
        <input
          value={form.platforms.join(", ")}
          onChange={(e) =>
            set(
              "platforms",
              e.target.value
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            )
          }
        />
      </label>
      <label className="label mt-4">
        Launch URL
        <input
          type="url"
          value={form.webUrl}
          onChange={(e) => set("webUrl", e.target.value)}
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="label">
          Current version
          <input
            value={form.currentVersion}
            onChange={(e) => set("currentVersion", e.target.value)}
          />
        </label>
        <label className="label">
          Latest version
          <input
            value={form.latestVersion}
            onChange={(e) => set("latestVersion", e.target.value)}
          />
        </label>
      </div>
      <button className="btn-primary mt-6 w-full">Save application</button>
    </form>
  );
}
export function Dashboard({
  user,
  setUser,
}: {
  user: User | null;
  setUser: (u: User | null) => void;
}) {
  const [apps, setApps] = useState<LauncherApp[]>([]),
    [edit, setEdit] = useState<LauncherApp | null>(null),
    [notice, setNotice] = useState("");
  const navigate = useNavigate();
  const load = () =>
    api
      .apps()
      .then(setApps)
      .catch(() => {
        auth();
        setUser(null);
        navigate("/login");
      });
  useEffect(() => {
    void load();
  }, []);
  if (!user) return <Login setUser={setUser} />;
  const save = async (input: AppInput) => {
    try {
      await api.saveApp(input, edit?._id);
      setNotice("Application saved successfully.");
      setEdit(null);
      load();
    } catch (e) {
      setNotice((e as Error).message);
    }
  };
  const logout = () => {
    auth();
    setUser(null);
    navigate("/login");
  };
  const metric = (label: string, value: string | number, note: string) => (
    <div className="stat-card">
      <span className="text-xs text-violet-200">{label}</span>
      <strong className="mt-2 block text-3xl">{value}</strong>
      <small className="text-violet-200">{note}</small>
    </div>
  );
  return (
    <>
      <Header user={user} logout={logout} />
      <main className="shell py-10">
        <p className="text-xs font-bold tracking-widest text-magic">
          {user.role.toUpperCase()} · COMMAND CENTER
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Good to see you, {user.name.split(" ")[0]}.
        </h1>
        <p className="mt-2 text-slate-500">
          Manage the Magic Worlds application ecosystem from one place.
        </p>
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metric(
            "Published apps",
            apps.filter((a) => a.status === "published").length,
            "Available in hub",
          )}
          {metric(
            "New launches",
            apps.filter((a) => a.isNew).length,
            "Featured this cycle",
          )}
          {metric(
            "Updates due",
            apps.filter((a) => a.updateAvailable).length,
            "Version review needed",
          )}
          {metric("Your access", user.role, "Company workspace")}
        </section>
        {notice && (
          <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            {notice}
          </p>
        )}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <AppForm key={edit?._id || "new"} app={edit || blank} onSave={save} />
          <div className="panel p-6">
            <h2 className="text-lg font-extrabold">
              Application library{" "}
              <span className="text-sm text-magic">{apps.length}</span>
            </h2>
            <div className="mt-3 divide-y divide-violet-100">
              {apps.map((app) => (
                <div className="flex items-center gap-3 py-3" key={app._id}>
                  <AppIcon type={app.type} />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">
                      {app.name}
                    </strong>
                    <small className="text-xs text-slate-500">
                      {app.category} · v{app.latestVersion}
                    </small>
                  </div>
                  {(user.role === "admin" || app.createdBy === user.id) && (
                    <button
                      className="btn-subtle !px-3 !py-2 text-xs"
                      onClick={() => setEdit(app)}
                    >
                      Edit
                    </button>
                  )}
                  {user.role === "admin" && (
                    <button
                      className="text-xs font-bold text-rose-600"
                      onClick={() => api.deleteApp(app._id).then(load)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
export function Team({
  user,
  setUser,
}: {
  user: User | null;
  setUser: (u: User | null) => void;
}) {
  const [people, setPeople] = useState<User[]>([]),
    [email, setEmail] = useState(""),
    [role, setRole] = useState("editor"),
    [message, setMessage] = useState(""),
    [inviteLink, setInviteLink] = useState(""),
    [editing, setEditing] = useState<User | null>(null);
  const navigate = useNavigate();
  const load = () =>
    api
      .users()
      .then(setPeople)
      .catch((e) => setMessage((e as Error).message));
  useEffect(() => {
    void load();
  }, []);
  if (!user || user.role !== "admin") return <Login setUser={setUser} />;
  return (
    <>
      <Header
        user={user}
        logout={() => {
          auth();
          setUser(null);
          navigate("/login");
        }}
      />
      <main className="shell py-10">
        <p className="text-xs font-bold tracking-widest text-magic">
          SYSTEM ADMINISTRATION
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Team access.</h1>
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <form
            className="panel p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const r = await api.invite(email, role);
                setMessage(r.message);
                setInviteLink(r.inviteUrl);
                setEmail("");
              } catch (err) {
                setMessage((err as Error).message);
                setInviteLink(
                  (err as Error & { inviteUrl?: string }).inviteUrl || "",
                );
              }
            }}
          >
            <h2 className="text-lg font-extrabold">Invite teammate</h2>
            <label className="label mt-5">
              Company email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="label mt-4">
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="btn-primary mt-5">
              <UserPlus size={17} />
              Generate invite
            </button>
            {message && (
              <p className="mt-4 break-all text-sm text-slate-600">{message}</p>
            )}
            {inviteLink && (
              <a
                className="mt-2 block break-all text-sm font-bold text-magic underline"
                href={inviteLink}
              >
                Manual activation link
              </a>
            )}
          </form>
          <div className="panel p-6">
            <h2 className="text-lg font-extrabold">Company users</h2>
            {people.map((p) => (
              <div
                className="mt-4 rounded-xl border border-violet-100 p-3"
                key={p.id}
              >
                {editing?.id === p.id ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                    />
                    <input
                      type="email"
                      value={editing.email}
                      onChange={(e) =>
                        setEditing({ ...editing, email: e.target.value })
                      }
                    />
                    <select
                      value={editing.role}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          role: e.target.value as User["role"],
                        })
                      }
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        className="btn-primary !px-3 !py-2 text-xs"
                        onClick={() =>
                          api
                            .updateUser(p.id, {
                              name: editing.name,
                              email: editing.email,
                              role: editing.role,
                            })
                            .then((updated) => {
                              setPeople(
                                people.map((person) =>
                                  person.id === updated.id ? updated : person,
                                ),
                              );
                              setEditing(null);
                              setMessage("User updated.");
                            })
                            .catch((e) => setMessage((e as Error).message))
                        }
                      >
                        Save
                      </button>
                      <button
                        className="btn-subtle !px-3 !py-2 text-xs"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-mist font-bold text-magic">
                      {p.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-sm">{p.name}</strong>
                      <small className="text-slate-500">
                        {p.email} · {p.role} ·{" "}
                        {p.active ? "Active" : "Inactive"}
                      </small>
                    </div>
                    <button
                      className="btn-subtle !px-3 !py-2 text-xs"
                      onClick={() => setEditing(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs font-bold text-magic"
                      onClick={() =>
                        api
                          .updateUser(p.id, { active: !p.active })
                          .then((updated) =>
                            setPeople(
                              people.map((person) =>
                                person.id === updated.id ? updated : person,
                              ),
                            ),
                          )
                          .catch((e) => setMessage((e as Error).message))
                      }
                    >
                      {p.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="text-xs font-bold text-rose-600"
                      onClick={() =>
                        api
                          .resetPassword(p.id)
                          .then((result) => setMessage(result.message))
                          .catch((e) => setMessage((e as Error).message))
                      }
                    >
                      Reset password
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
export function AcceptInvite({ setUser }: { setUser: (u: User) => void }) {
  const [params] = useSearchParams();
  const [name, setName] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <main className="shell grid min-h-[calc(100vh-73px)] place-items-center">
        <form
          className="panel w-full max-w-md p-7"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const d = await api.acceptInvite(
                params.get("token") || "",
                name,
                password,
              );
              localStorage.setItem("mw_token", d.token);
              setUser(d.user);
              navigate("/manage");
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <h1 className="text-3xl font-extrabold">Activate your access.</h1>
          <label className="label mt-6">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="label mt-4">
            Password
            <input
              required
              minLength={12}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <button className="btn-primary mt-6 w-full">Activate account</button>
        </form>
      </main>
    </>
  );
}

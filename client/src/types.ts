export type AppType = "web" | "desktop" | "mobile" | "service";
export type Role = "admin" | "editor" | "viewer";
export interface LauncherApp {
  _id: string;
  name: string;
  description: string;
  type: AppType;
  category: string;
  platforms: string[];
  webUrl?: string;
  downloadUrl?: string;
  currentVersion: string;
  latestVersion: string;
  isNew: boolean;
  isFeatured: boolean;
  status: "draft" | "published" | "archived";
  createdBy?: string;
  updateAvailable?: boolean;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}
export type AppInput = Omit<LauncherApp, "_id" | "updateAvailable">;

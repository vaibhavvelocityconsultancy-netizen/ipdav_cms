import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

const delegateAliases = {
  footerSettings: "footersettings",
  formSubmission: "formsubmission",
  menuItem: "menuitem",
  rolePermission: "rolepermission",
  siteSettings: "sitesettings",
  userPermission: "userpermission",
};

const createPrismaProxy = (client) =>
  new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (value !== undefined || typeof prop !== "string") {
        return value;
      }
      const alias = delegateAliases[prop];
      return alias ? Reflect.get(target, alias, receiver) : value;
    },
  });

const prisma =
  globalForPrisma.prisma ?? createPrismaProxy(createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };

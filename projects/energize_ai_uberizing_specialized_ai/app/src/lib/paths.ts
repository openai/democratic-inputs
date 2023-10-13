import { z } from "zod"

import { RoleNameSchema } from "@energizeai/engine"

export enum Paths {
  Spaces = "/spaces",
  Suggestions = "/spaces/:id/suggestions",
  SpaceWaitlist = "/spaces/:id/waitlist",
  Export = "/spaces/:id/export",
  Members = "/spaces/:id/members",
  ProlificMembers = "/spaces/:id/prolific",
  ChatMessages = "/spaces/:id/chat-messages",
  Taxonomy = "/spaces/:id/taxonomy",
  RatingTags = "/spaces/:id/rating-tags",
  ApiKeys = "/spaces/:id/api-keys",
  PromptPool = "/spaces/:id/prompt-pool",
  Guidelines = "/spaces/:id/guidelines",
  Dashboard = "/spaces/:id/dashboard",
  ShortenedUrl = "/s/:shortened_url",
  Playground = "/spaces/:id",
  Feedback = "/feedback",
  Prolific = "/prolific",
  Profile = "/account/profile",
  Demographics = "/account/demographics",
  MyGuidelines = "/spaces/:id/my-guidelines",
  MyRatings = "/spaces/:id/my-ratings",
  Blogs = "/blogs/:id",
  Waitlist = "/waitlist",
  Home = "/",
  LiveConstitution = "/live",
  LiveDemographics = "/demographics",
  Algo = "/algo",
  NotFound = "/404",
  Instructions = "/spaces/:id/instructions",
}

export type RoutePermissions = {
  needsAuth: boolean
  allowedRoles: z.infer<typeof RoleNameSchema>[]
}

export const PERMISSIONS_MAP: Record<Paths, RoutePermissions> = {
  [Paths.Home]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.Prolific]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.LiveDemographics]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.LiveConstitution]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.Algo]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.ShortenedUrl]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.MyRatings]: {
    needsAuth: true,
    allowedRoles: [],
  },
  [Paths.MyGuidelines]: {
    needsAuth: true,
    allowedRoles: [],
  },
  [Paths.Demographics]: {
    needsAuth: true,
    allowedRoles: [],
  },
  [Paths.Profile]: {
    needsAuth: true,
    allowedRoles: [],
  },
  [Paths.Waitlist]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.Blogs]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.NotFound]: {
    needsAuth: false,
    allowedRoles: [],
  },
  [Paths.Suggestions]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.Spaces]: {
    needsAuth: true,
    allowedRoles: [],
  },
  [Paths.SpaceWaitlist]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.Guidelines]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.PromptPool]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.Export]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.ProlificMembers]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.Members]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.RatingTags]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.ApiKeys]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.Taxonomy]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.ChatMessages]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.Dashboard]: {
    needsAuth: true,
    allowedRoles: ["admin"],
  },
  [Paths.Instructions]: {
    needsAuth: true,
    allowedRoles: ["admin", "moderator", "member"],
  },
  [Paths.Playground]: {
    needsAuth: true,
    allowedRoles: ["admin", "moderator", "member"],
  },
  [Paths.Feedback]: {
    needsAuth: true,
    allowedRoles: [],
  },
}

export const PublicRoutes = Object.keys(PERMISSIONS_MAP).filter((key) => !PERMISSIONS_MAP[key as Paths].needsAuth)

export const SEARCH_PARAM_KEYS = {
  [Paths.Playground]: {
    guidelineId: "guidelineId",
    topicId: "topicId",
    openConstitution: "openConstitution",
  },
}
